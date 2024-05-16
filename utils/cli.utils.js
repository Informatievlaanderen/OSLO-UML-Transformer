"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCommand = exports.generateCliCommand = void 0;
const child_process_1 = require("child_process");
const generateCliCommand = (eapConfig) => `oslo-converter-ea --umlFile ${eapConfig.umlFile} --diagramName ${eapConfig.diagramName} --specificationType ${eapConfig.specificationType} --versionId ${eapConfig.versionId} --publicationEnvironment ${eapConfig.publicationEnvironment}`;
exports.generateCliCommand = generateCliCommand;
const runCommand = (command) => new Promise((resolve, reject) => {
    (0, child_process_1.exec)(command, (error, stdout, stderr) => {
        if (stderr) {
            const stderrLines = stderr.split('\n');
            const errorIndex = stderrLines.findIndex((line) => line.includes('Error:'));
            if (stderrLines[0].includes('TypeError')) {
                reject(new Error(`${stderrLines[0]}\n ${stderrLines[9]}\n ${stderrLines[10]}`));
            }
            else {
                reject(new Error(stderrLines[errorIndex]));
            }
        }
    });
});
exports.runCommand = runCommand;
//# sourceMappingURL=cli.utils.js.map