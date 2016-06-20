import * as _ from "lodash";
import { Agda } from "../types";
var lispToArray = require("lisp-to-array");

function parseAgdaResponse(tokens: Array<any>): Agda.Response {
    switch (tokens[0]) {
        case "agda2-info-action":
            let type = parseInfoActionType(tokens[1]);
            let content = tokens.length === 3 ? [] : _.compact(tokens[2].split("\\n"));
            return {
                type: Agda.ResponseType.InfoAction,
                infoActionType: type,
                content: content
            } as Agda.InfoAction;
        case "agda2-status-action":
            return {
                type: Agda.ResponseType.StatusAction,
                content: tokens.slice(1, 2)
            } as Agda.StatusAction;
        case "agda2-goals-action":
            return {
                type: Agda.ResponseType.GoalsAction,
                content: tokens[1]
            } as Agda.GoalsAction;
        case "agda2-give-action":
            let index = parseInt(tokens[1]);
            // with parenthesis: ["agda2-give-action", 1, "'paren"]
            // w/o  parenthesis: ["agda2-give-action", 1, "'no-paren"]
            // with content    : ["agda2-give-action", 0, ...]
            switch (tokens[2]) {
                case "'paren": return {
                        type: Agda.ResponseType.GiveAction,
                        index: index,
                        content: [],
                        hasParenthesis: true
                    } as Agda.GiveAction;
                case "'no-paren": return {
                        type: Agda.ResponseType.GiveAction,
                        index: index,
                        content: [],
                        hasParenthesis: false
                    } as Agda.GiveAction;
                default: return {
                        type: Agda.ResponseType.GiveAction,
                        index: index,
                        content: tokens[2],
                        hasParenthesis: false
                    } as Agda.GiveAction;
            }
        case "agda2-parse-error":
            return {
                type: Agda.ResponseType.ParseError,
                content: tokens.slice(1)
            } as Agda.ParseError;
        case "agda2-goto":
        case "agda2-maybe-goto":
            return {
                type: Agda.ResponseType.Goto,
                filepath: tokens[1][0],
                position: tokens[1][2]
            } as Agda.Goto;
        case "agda2-solveAll-action":
            return {
                type: Agda.ResponseType.SolveAllAction,
                solution: _.chunk(tokens[1], 2)
            } as Agda.SolveAllAction;
        case "agda2-make-case-action":
            return {
                type: Agda.ResponseType.MakeCaseAction,
                content: tokens[1]
            } as Agda.MakeCaseAction;
        case "agda2-make-case-action-extendlam":
            return {
                type: Agda.ResponseType.MakeCaseActionExtendLam,
                content: tokens[1]
            } as Agda.MakeCaseActionExtendLam;
        case "agda2-highlight-clear":
            return {
                type: Agda.ResponseType.HighlightClear,
            } as Agda.HighlightClear;
        case "agda2-highlight-add-annotations":
            let annotations: Array<Agda.Annotation> = _
                .tail(tokens)
                .map((obj) => {
                    if (obj[4]) {
                        return {
                            start: obj[0],
                            end: obj[1],
                            type: obj[2],
                            sourse: {
                                filepath: obj[4][0],
                                index: obj[4][2]
                            }
                        };

                    } else {
                        return {
                            start: obj[0],
                            end: obj[1],
                            type: obj[2]
                        };
                    }
                });
            return {
                type: Agda.ResponseType.HighlightAddAnnotations,
                content: annotations
            } as Agda.HighlightAddAnnotations;
        case "agda2-highlight-load-and-delete-action":
            return {
                type: Agda.ResponseType.HighlightLoadAndDeleteAction,
                content: tokens[1]
            } as Agda.HighlightLoadAndDeleteAction;
        default:
            return {
                type: Agda.ResponseType.UnknownAction,
                content: tokens
            } as Agda.UnknownAction;
    }
}

function parseInfoActionType(s: String): Agda.InfoActionType {
    switch (s) {
        case "*All Goals*":         return Agda.InfoActionType.AllGoals;
        case "*Error*":             return Agda.InfoActionType.Error;
        case "*Type-checking*":     return Agda.InfoActionType.TypeChecking;
        case "*Current Goal*":      return Agda.InfoActionType.CurrentGoal;
        case "*Inferred Type*":     return Agda.InfoActionType.InferredType;
        case "*Module contents*":   return Agda.InfoActionType.ModuleContents;
        case "*Context*":           return Agda.InfoActionType.Context;
        case "*Goal type etc.*":    return Agda.InfoActionType.GoalTypeEtc;
        case "*Normal Form*":       return Agda.InfoActionType.NormalForm;
        case "*Intro*":             return Agda.InfoActionType.Intro;
        case "*Auto*":              return Agda.InfoActionType.Auto;
        case "*Constraints*":       return Agda.InfoActionType.Constraints;
        case "*Scope Info*":        return Agda.InfoActionType.ScopeInfo;
    }
}

////////////////////////////////////////////////////////////////////////////////
//  Parsing S-Expressions
////////////////////////////////////////////////////////////////////////////////
function parseSExpression(s: string): string {
    return postprocess(lispToArray(preprocess(s)));
}

function preprocess(chunk) {
    if (chunk.startsWith("((last")) {
        // drop wierd prefix like ((last . 1))
        let index = chunk.indexOf("(agda");
        let length = chunk.length
        chunk = chunk.substring(index, length - 1);
    }
    if (chunk.startsWith("cannot read: ")) {
        // handles Agda parse error
        chunk = chunk.substring(12);
        chunk = `(agda2-parse-error${chunk})`;
    }
    // make it friendly to 'lisp-to-array' package
    chunk = chunk.replace(/'\(/g, '(__number__ ');
    chunk = chunk.replace(/\("/g, '(__string__ "');
    chunk = chunk.replace(/\(\)/g, '(__nil__)');

    return chunk;
}

// recursive cosmetic surgery
function postprocess(node) {
    if (node instanceof Array) {
        switch (node[0]) {
            case "`":           // ["`", "some string"] => "some string"
                return postprocess(node[1]);
            case "__number__":  // ["__number__", 1, 2, 3] => [1, 2, 3]
            case "__string__":  // ["__string__", 1, 2, 3] => [1, 2, 3]
            case "__nil__":     // ["__nil__"]             => []
                node.shift();
                return postprocess(node);
            default:            // keep traversing
                return node.map(function(x) { return postprocess(x); });
        }
    } else {
        if (typeof node === "string") {
            // some ()s in strings were replaced with (__nil__) when preprocessing
            return node.replace("(__nil__)", "()");
        } else {
            return node;
        }
    }
}

export {
    parseSExpression,
    parseAgdaResponse
}
