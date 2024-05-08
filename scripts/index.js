"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
        .map((publication) => `${publication.repository}/raw/master/${publication.filename}`);
    // Only keep unique URLs
    const uniqueUrls = [...new Set(urls)];
    const configs = await (0, utils_1.getConfigFiles)(uniqueUrls);
    // Create config files that contain just the required parameters for the CLI
    const eapConfigs = configs.map((config) => (0, utils_1.generateEapConfig)(config));
    // Create the CLI command using the new eapConfig
    const commands = eapConfigs.map((eapConfig) => (0, cli_utils_1.generateCliCommand)(eapConfig));
    const promises = commands.map((command) => (0, cli_utils_1.runCommand)(command));
    await Promise.all(promises);
};
run()
    .then(() => {
    console.log(`All EAP files have been validated for the ${constants_1.ENVIRONMENT} environment.`);
})
    .catch((error) => {
    console.error('Error during script:', error);
})
    .finally(async () => {
    console.log('Cleaning up...');
    const zipPath = path_1.default.join(__dirname, constants_1.ZIP_NAME);
    const dir = path_1.default.join(__dirname, `${constants_1.REPO_NAME}-${constants_1.ENVIRONMENT}`);
    await (0, utils_1.cleanup)(zipPath, dir);
    console.log('Script finished.');
});
//# sourceMappingURL=index.js.map