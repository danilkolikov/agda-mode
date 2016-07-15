import Goal from "./goal";

import { ParsedPath } from "path";
type Range = any;

export type TextInput = string;

interface IndexRange {
    start: number,
    end: number
}

interface Token {
    content: string,
    range: IndexRange,
    type: TokenType
}

const enum TokenType {
    Raw,
    Comment,
    GoalBracket,
    GoalQMRaw, // ? + ?
    GoalQM // ?
}

interface Hole {
    index: number,
    modifiedRange: IndexRange,
    originalRange: IndexRange,
    content: string
}

namespace Agda {

    export type Response =
        InfoAction |
        StatusAction |
        GoalsAction |
        GiveAction |
        ParseError |
        Goto |
        SolveAllAction |
        MakeCaseAction |
        MakeCaseActionExtendLam |
        HighlightClear |
        HighlightAddAnnotations |
        HighlightLoadAndDeleteAction |
        UnknownAction

    export interface InfoAction {
        kind: "InfoAction";
        infoActionKind: "AllGoals" | "Error" | "TypeChecking" | "CurrentGoal" |
            "InferredType" | "ModuleContents" | "Context" | "GoalTypeEtc" |
            "NormalForm" | "Intro" | "Auto" | "Constraints" | "ScopeInfo";
        content: string[];
    }

    export interface StatusAction {
        kind: "StatusAction";
        content: string[];
    }
    export interface GoalsAction {
        kind: "GoalsAction";
        content: number[];
    }
    export interface GiveAction {
        kind: "GiveAction";
        index: number;
        content: string;
        hasParenthesis: boolean;
    }

    export interface ParseError {
        kind: "ParseError";
        content: string[];
    }

    export interface Goto {
        kind: "Goto";
        filepath: string;
        position: number;
    }
    export interface SolveAllAction {
        kind: "SolveAllAction";
        solutions: {
            index: number,
            expression: string
        }[];
    }
    export interface MakeCaseAction {
        kind: "MakeCaseAction";
        content: string[];
    }
    export interface MakeCaseActionExtendLam {
        kind: "MakeCaseActionExtendLam";
        content: string[];
    }
    export interface HighlightClear {
        kind: "HighlightClear";
        content: string[];
    }
    export interface HighlightAddAnnotations {
        kind: "HighlightAddAnnotations";
        content: Annotation[];
    }

    export interface HighlightLoadAndDeleteAction {
        kind: "HighlightLoadAndDeleteAction";
        content: string;
    }
    export interface UnknownAction {
        kind: "UnknownAction";
        content: string[];
    }

    export interface Annotation {
        start: string,
        end: string,
        type: string[]
        source?: {
            filepath: string,
            index: string
        }
    }
}

//
//  agda-mode commands
//

type Command = Command.Load | Command.Quit | Command.Restart | Command.Compile |
    Command.ToggleDisplayOfImplicitArguments | Command.Info |
    Command.ShowConstraints | Command.SolveConstraints | Command.ShowGoals |
    Command.NextGoal | Command.PreviousGoal | Command.WhyInScope |
    Command.InferType | Command.ModuleContents | Command.ComputeNormalForm |
    Command.ComputeNormalFormIgnoreAbstract | Command.Give | Command.Refine |
    Command.Auto | Command.Case | Command.GoalType | Command.Context |
    Command.GoalTypeAndContext | Command.GoalTypeAndInferredType |
    Command.InputSymbol;

namespace Command {
    export interface Load {
        kind: "Load"
    }
    export interface Quit {
        kind: "Quit"
    }
    export interface Restart {
        kind: "Restart"
    }
    export interface Compile {
        kind: "Compile"
    }
    export interface ToggleDisplayOfImplicitArguments {
        kind: "ToggleDisplayOfImplicitArguments"
    }
    export interface Info {
        kind: "Info"
    }
    export interface ShowConstraints {
        kind: "ShowConstraints"
    }
    export interface SolveConstraints {
        kind: "SolveConstraints"
    }
    export interface ShowGoals {
        kind: "ShowGoals"
    }
    export interface NextGoal {
        kind: "NextGoal"
    }
    export interface PreviousGoal {
        kind: "PreviousGoal"
    }
    export interface WhyInScope {
        kind: "WhyInScope"
    }
    export interface InferType {
        kind: "InferType",
        normalization: Normalization
    }
    export interface ModuleContents {
        kind: "ModuleContents",
        normalization: Normalization
    }
    export interface ComputeNormalForm {
        kind: "ComputeNormalForm"
    }
    export interface ComputeNormalFormIgnoreAbstract {
        kind: "ComputeNormalFormIgnoreAbstract"
    }
    export interface Give {
        kind: "Give"
    }
    export interface Refine {
        kind: "Refine"
    }
    export interface Auto {
        kind: "Auto"
    }
    export interface Case {
        kind: "Case"
    }
    export interface GoalType {
        kind: "GoalType",
        normalization: Normalization
    }
    export interface Context {
        kind: "Context",
        normalization: Normalization
    }
    export interface GoalTypeAndContext {
        kind: "GoalTypeAndContext",
        normalization: Normalization
    }
    export interface GoalTypeAndInferredType {
        kind: "GoalTypeAndInferredType",
        normalization: Normalization
    }
    export interface InputSymbol {
        kind: "InputSymbol"
    }
}

type Normalization = "Simplified" | "Instantiated" | "Normalised";
// const enum Normalization {
//     Simplified,
//     Instantiated,
//     Normalised
// }

type Result = Command;

//
//  View
//

namespace View {

    export const enum Type {
        PlainText,
        Error,
        Warning,
        Judgement,
        Value
    }

    export type JudgementForm = "goal" |
        "type judgement" |
        "meta" |
        "term" |
        "sort" ;

    // Occurence & Location
    export interface Location {
        path: string,
        range: Range,
        isSameLine: boolean
    }

    export interface Occurence {
        location: Location,
        body: string
    }


    ////////////////////////////////////////////
    // Body components
    ////////////////////////////////////////////

    export interface Content {
        banner: BannerItem[],
        body: BodyItem[]
    }

    export interface BannerItem {
        type: string,
        label: string
    }

    export interface Goal {
        judgementForm: JudgementForm,
        type: string,
        index: string
    }

    export interface Judgement {
        judgementForm: JudgementForm,
        type: string,
        expr: string,
        index?: string
    }

    export interface Term {
        judgementForm: JudgementForm,
        expr: string
    }

    export interface Meta {
        judgementForm: JudgementForm,
        type: string,
        location: Location,
        index: string
    }

    export interface Sort {
        judgementForm: JudgementForm,
        location: Location,
        index: string
    }


    export type BodyItem = Goal | Judgement | Term | Meta | Sort;

    export interface Body {
        goal: Goal[],
        judgement: Judgement[],
        term: Term[],
        meta: Meta[],
        sort: Sort[]
    }

    export type Suggestion = string[];

    ////////////////////////////////////////////
    // Errors
    ////////////////////////////////////////////

    export type Error = NotInScope |
        TypeMismatch |
        DefinitionTypeMismatch |
        BadConstructor |
        RHSOmitted |
        MissingType |
        MultipleDefinition |
        MissingDefinition |
        Termination |
        ConstructorTarget |
        FunctionType |
        ModuleMismatch |
        Parse |
        CaseSingleHole |
        PatternMatchOnNonDatatype |
        // ApplicationParseError |
        // TerminationError |
        // ParseError |
        Unparsed;

    export const enum ErrorType {
        NotInScope,
        TypeMismatch,
        DefinitionTypeMismatch,
        BadConstructor,
        RHSOmitted,
        MissingType,
        MultipleDefinition,
        MissingDefinition,
        Termination,
        ConstructorTarget,
        FunctionType,
        ModuleMismatch,
        Parse,
        CaseSingleHole,
        PatternMatchOnNonDatatype,
        // ApplicationParseError,
        // TerminationError,
        // ParseError,
        Unparsed
    }

    export interface NotInScope {
        type: ErrorType,
        location: Location,
        suggestion: Suggestion,
        expr: string
    }

    export interface TypeMismatch {
        type: ErrorType,
        location: Location
        expected: string,
        expectedType: string,
        actual: string,
        expr: string,
        exprType: string
    }

    export interface DefinitionTypeMismatch {
        type: ErrorType,
        location: Location
        expected: string,
        expectedType: string,
        actual: string,
        expr: string,
        exprType: string
    }

    export interface BadConstructor {
        type: ErrorType,
        location: Location,
        constructor: string,
        constructorType: string,
        expr: string,
        exprType: string
    }

    export interface RHSOmitted {
        type: ErrorType,
        location: Location,
        expr: string,
        exprType: string
    }

    export interface MissingType {
        type: ErrorType,
        location: Location,
        expr: string
    }

    export interface MultipleDefinition {
        type: ErrorType,
        location: Location,
        locationPrev: Location,
        expr: string,
        decl: string,
        declType: string
    }

    export interface MissingDefinition {
        type: ErrorType,
        location: Location,
        expr: string
    }

    export interface Termination {
        type: ErrorType,
        location: Location,
        expr: string,
        calls: {
            expr: string,
            location: Location
        }[]
    }

    export interface ConstructorTarget {
        type: ErrorType,
        location: Location,
        expr: string,
        ctor: string,
        decl: string
    }

    export interface FunctionType {
        type: ErrorType,
        location: Location,
        expr: string,
        exprType: string
    }

    export interface ModuleMismatch {
        type: ErrorType,
        wrongPath: string,
        rightPath: string,
        moduleName: string
    }

    export interface Parse {
        type: ErrorType,
        location: Location
        message: string,
        expr: string,
    }

    export interface CaseSingleHole {
        type: ErrorType,
        location: Location,
        expr: string,
        exprType: string
    }

    export interface PatternMatchOnNonDatatype {
        type: ErrorType,
        location: Location,
        nonDatatype: string,
        expr: string,
        exprType: string
    }
    // export interface ApplicationParseError {
    //     type: ErrorType,
    //     expr: string,
    //     location: Location
    // }
    //
    export interface Unparsed {
        type: ErrorType,
        input: string,
    }



}


export {
    Agda,
    Hole,
    Goal,
    Token,
    TokenType,
    // commands
    Command,
    Normalization,
    Result,
    // view
    View
}
