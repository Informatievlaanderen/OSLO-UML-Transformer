"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCommand = exports.generateCliCommand = void 0;
const child_process_1 = require("child_process");
const generateCliCommand = (eapConfig) => `oslo-converter-ea --umlFile ${eapConfig.umlFile} --diagramName ${eapConfig.diagramName} --specificationType ${eapConfig.specificationType} --versionId ${eapConfig.versionId} --publicationEnvironment ${eapConfig.publicationEnvironment} --verbose`;
exports.generateCliCommand = generateCliCommand;
const runCommand = (command) => new Promise((resolve, reject) => {
    (0, child_process_1.exec)(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing command: ${error.message}`);
            reject(error);
            return;
        }
        if (stderr) {
            console.error(`Command stderr: ${stderr}`);
            reject(new Error(stderr));
            return;
        }
        console.log(`Command stdout: ${stdout}`);
        resolve(stdout);
    });
});
exports.runCommand = runCommand;
//# sourceMappingURL=cli.utils.js.map