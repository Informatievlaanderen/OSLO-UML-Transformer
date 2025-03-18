"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const constants_1 = require("./constants/constants");
const cli_utils_1 = require("./utils/cli.utils");
const utils_1 = require("./utils/utils");
const run = async () => {
    console.log(`Validating EAP files for the ${constants_1.ENVIRONMENT} environment...`);
    const targetPath = path_1.default.join(__dirname, './');
    const zipPath = path_1.default.join(__dirname, constants_1.ZIP_NAME);
    const dir = path_1.default.join(__dirname, `${constants_1.REPO_NAME}-${constants_1.ENVIRONMENT}/config/${constants_1.ENVIRONMENT}`);
    await (0, utils_1.createZipFromGithub)(constants_1.GITHUB_REPO, zipPath);
    await (0, utils_1.extractZip)(constants_1.ZIP_NAME, targetPath);
    const files = await (0, utils_1.listFiles)(dir);
    const content = await (0, utils_1.readFiles)(dir, files);
    const publications = content.flat();
    const urls = publications
        // If the config has a repository and a filename, we can build the URL
        .filter((publication) => publication.repository && publication.filename)
        .map((publication) => `${publication.repository}/raw/${constants_1.BRANCH}/${publication.filename}`);
    // Only keep unique URLs
    const uniqueUrls = [...new Set(urls)];
    const configs = await (0, utils_1.getConfigFiles)(uniqueUrls);
    // Log the eapConfigs that will be used to run the CLI commands
    configs.forEach((config) => {
        fs_1.default.appendFile('configs.log', `${config.title}\n`, (err) => {
            if (err) {
                console.error(`Failed to write to config log file: ${err.message}`);
            }
        });
    });
    // Create config files that contain just the required parameters for the CLI
    const eapConfigs = configs.map((config) => (0, utils_1.generateEapConfig)(config));
    // Create the CLI command using the new eapConfig
    const commands = eapConfigs.map((eapConfig) => (0, cli_utils_1.generateCliCommand)(eapConfig));
    const promises = commands.map((command) => (0, cli_utils_1.runCommand)(command).catch((error) => {
        console.log(`Error during command: ${command}${error}`);
        if (!error)
            return;
        const errorMessage = `Command: ${command} \n ${error}\n`;
        fs_1.default.appendFile('error.log', errorMessage, (err) => {
            if (err) {
                console.error(`Failed to write to log file: ${err.message}`);
            }
        });
    }));
    await Promise.all(promises);
};
run()
    .then(() => {
    console.log(`All EAP files have been validated for the ${constants_1.ENVIRONMENT} environment.`);
})
    .catch((error) => {
    const errorMessage = `Error during script: ${error}\n`;
    fs_1.default.appendFile('error.log', errorMessage, (err) => {
        if (err) {
            console.error(`Failed to write to log file: ${err.message}`);
            throw new Error(err.message);
        }
    });
})
    .finally(async () => {
    console.log('Cleaning up...');
    const zipPath = path_1.default.join(__dirname, constants_1.ZIP_NAME);
    const dir = path_1.default.join(__dirname, `${constants_1.REPO_NAME}-${constants_1.ENVIRONMENT}`);
    await (0, utils_1.cleanup)(zipPath, dir);
    console.log('Script finished.');
});
//# sourceMappingURL=index.js.map