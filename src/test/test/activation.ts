import * as _ from 'lodash';
import * as Promise from 'bluebird';
import * as path from 'path';
import * as fs from 'fs';
import * as temp from 'temp';
import * as util from 'util';

import * as AgdaMode from '../../agda-mode';
AgdaMode; // a dummy refernce here so that the module will be imported
declare var atom: any;

import * as chai from 'chai';
import 'mocha';
import 'chai-as-promised';
// import 'chai-things';
chai.should();
chai.use(require('chai-as-promised'));
// chai.use(require('chai-things'))

// Automatically track and cleanup files at exit
temp.track()

// opens a new Agda file, and returns correspoding TextEditor
const open: (options: any) => Promise<any> = (options) => new Promise((resolve, reject) => {
    temp.open(options, (error, info) => {
        atom.workspace.open(info.path).then(resolve).catch(reject)
    });
});

const close = (editor) => {
    const pane = atom.workspace.paneForItem(editor);
    if (pane)
        pane.destroyItem(editor);
}

const getActivePackageNames = () => atom.packages.getActivePackages().map((o) => o.name)
const getLoadedPackageNames = () => atom.packages.getLoadedPackages().map((o) => o.name)

describe('Acitvation', () => {
    // temporary directory
    const directory = null;

    // activate language-agda before everything
    before(() => {
        return atom.packages.activatePackage('language-agda')
    });

    describe('activating agda-mode', () => {

        let activationPromise;

        beforeEach(() => {
            if (_.includes(getActivePackageNames(), 'agda-mode')) {
                atom.packages.deactivatePackage('agda-mode');
            }
            activationPromise = atom.packages.activatePackage('agda-mode');
        });

        it('should be activated after triggering agda-mode:load on .agda files', (done) => {
            open({dir: directory, suffix: '.agda'})
                .then((editor) => {
                    // get the element of the editor so that we could dispatch commands
                    const element = atom.views.getView(editor)
                    atom.commands.dispatch(element, 'agda-mode:load');
                    // wait after it's activated
                    activationPromise.then(() => {
                        getActivePackageNames().should.contain('agda-mode');
                        editor.should.have.property('core');
                        close(editor)
                        done();
                    });
                });
        });

        it('should be activated after triggering agda-mode:load on .lagda files', (done) => {
            open({dir: directory, suffix: '.lagda'})
                .then((editor) => {
                    // get the element of the editor so that we could dispatch commands
                    const element = atom.views.getView(editor)
                    console.log(atom.workspace.getPaneItems())
                    atom.commands.dispatch(element, 'agda-mode:load');
                    // wait after it's activated
                    activationPromise.then(() => {
                        getActivePackageNames().should.contain('agda-mode');
                        editor.should.have.property('core');
                        close(editor)
                        done();
                    });
                });
        });
    });
});

// describe('Spawn a group of files', () => {
//     // temporary directory
//     const directory = null;
//
//     // options for different types of files
//     const agdaFile = {dir: directory, suffix: '.agda'};
//     const lagdaFile = {dir: directory, suffix: '.lagda'};
//     const otherFile = {dir: directory, suffix: '.others'};
//
//     let tempAgdaFile = null;
//
//     describe('loading language-agda', () => {
//         it('should be loaded', (done) => {
//             atom.packages.activatePackage('language-agda').then(() => {
//                 getLoadedPackageNames().should.contain('language-agda');
//                 done()
//             });
//         });
//     });
//
//     describe('before activating agda-mode', () => {
//
//         it('should not be activated before triggering events', () => {
//             getActivePackageNames().should.not.contain('agda-mode');
//             open(agdaFile)
//                 .then((editor) => {
//                     editor.should.not.have.property('core');
//                     close(editor);
//                 });
//         });
//
//     });
//
//     describe('activating agda-mode', () => {
//
//         let activationPromise;
//
//         beforeEach(() => {
//             if (_.includes(getActivePackageNames(), 'agda-mode'))
//                 atom.packages.deactivatePackage('agda-mode');
//             activationPromise = atom.packages.activatePackage('agda-mode');
//             return
//         });
//
//         it('should be activated after triggering "agda-mode:load" in .agda files', (done) => {
//             open(agdaFile)
//                 .then((editor) => {
//                     // get the element of the editor so that we could dispatch commands
//                     const element = atom.views.getView(editor)
//                     atom.commands.dispatch(element, 'agda-mode:load');
//                     // wait after it's activated
//                     activationPromise.then(() => {
//                         getActivePackageNames().should.contain('agda-mode');
//                         editor.should.have.property('core');
//                         close(editor)
//                         done();
//                     });
//                 });
//         });
//
//         it('should be activated after triggering "agda-mode:load" in .lagda files', (done) => {
//
//             open(lagdaFile)
//                 .then((editor) => {
//                     // get the element of the editor so that we could dispatch commands
//                     const element = atom.views.getView(editor)
//                     atom.commands.dispatch(element, 'agda-mode:load');
//                     // wait after it's activated
//                     activationPromise.then(() => {
//                         getActivePackageNames().should.contain('agda-mode');
//                         editor.should.have.property('core');
//                         close(editor);
//                         done();
//                     });
//                 });
//         });
//
//         // it('should be activated after triggering "agda-mode:input-symbol" in .agda files', (done) => {
//         //     open(agdaFile)
//         //         .then((editor) => {
//         //             // get the element of the editor so that we could dispatch commands
//         //             const element = atom.views.getView(editor)
//         //             atom.commands.dispatch(element, 'agda-mode:input-symbol');
//         //             // wait after it's activated
//         //             activationPromise.then(() => {
//         //                 getActivePackageNames().should.contain('agda-mode');
//         //                 editor.should.have.property('core');
//         //                 close(editor)
//         //                 done();
//         //             });
//         //         });
//         // });
//
//         // it('should be activated after triggering "agda-mode:input-symbol" in .lagda files', (done) => {
//         //
//         //     open(lagdaFile)
//         //         .then((editor) => {
//         //             // get the element of the editor so that we could dispatch commands
//         //             const element = atom.views.getView(editor)
//         //             atom.commands.dispatch(element, 'agda-mode:input-symbol');
//         //             // wait after it's activated
//         //             activationPromise.then(() => {
//         //                 getActivePackageNames().should.contain('agda-mode');
//         //                 editor.should.have.property('core');
//         //                 close(editor);
//         //                 done();
//         //             });
//         //         });
//         // });
//     });
//
// });
