"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateEapConfig = exports.getConfigFiles = exports.addRepositoryUrl = exports.getConfigFile = exports.readFiles = exports.readFile = exports.listFiles = exports.createZipFromGithub = exports.downloadFile = exports.extractZip = void 0;
const fs_1 = __importDefault(require("fs"));
const https_1 = __importDefault(require("https"));
const path_1 = __importDefault(require("path"));
const axios_1 = __importDefault(require("axios"));
const extract_zip_1 = __importDefault(require("extract-zip"));
const constants_1 = require("../constants/constants");
const enum_1 = require("../constants/enum");
const extractZip = async (zipPath, destination) => {
    try {
        await (0, extract_zip_1.default)(zipPath, { dir: destination });
        console.log('Extraction complete');
    }
    catch (error) {
        console.error('Error during extraction:', error);
    }
};
exports.extractZip = extractZip;
const downloadFile = (url, dest) => new Promise((resolve, reject) => {
    try {
        const file = fs_1.default.createWriteStream(dest);
        https_1.default.get(url, (response) => {
            var _a, _b, _c;
            // Extra check for redirect since the Github URL behind 'Download as zip' button is a redirect
            if (response.statusCode === 302 || response.statusCode === 301) {
                console.log('Redirecting to new location', (_a = response === null || response === void 0 ? void 0 : response.headers) === null || _a === void 0 ? void 0 : _a.location);
                // Redirect - download from new location
                return (0, exports.downloadFile)((_c = (_b = response === null || response === void 0 ? void 0 : response.headers) === null || _b === void 0 ? void 0 : _b.location) !== null && _c !== void 0 ? _c : '', dest);
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log('Download Completed');
                resolve();
            });
            file.on('error', (err) => {
                console.error('Error during download:', err);
                reject(err);
            });
        });
    }
    catch (error) {
        console.error('Error during download:', error);
        reject(error);
    }
});
exports.downloadFile = downloadFile;
const createZipFromGithub = async (url, pathName) => {
    try {
        await (0, exports.downloadFile)(url, pathName);
    }
    catch (error) {
        console.error('Error during zip creation process:', error);
    }
};
exports.createZipFromGithub = createZipFromGithub;
const listFiles = async (dir) => new Promise((resolve, reject) => {
    fs_1.default.readdir(dir, (err, files) => {
        if (err) {
            console.error('Error during script:', err);
            reject(err);
        }
        else {
            resolve(files);
        }
    });
});
exports.listFiles = listFiles;
const readFile = async (filePath) => new Promise(async (resolve, reject) => {
    try {
        const fileContent = await fs_1.default.promises.readFile(filePath, 'utf-8');
        resolve(fileContent);
    }
    catch (error) {
        console.error(`Error reading file ${filePath}:`, error);
        reject(error);
    }
});
exports.readFile = readFile;
const readFiles = async (dir, fileNames) => new Promise(async (resolve, reject) => {
    const filesContent = [];
    for (const fileName of fileNames) {
        const filePath = path_1.default.join(dir, fileName);
        try {
            const content = await (0, exports.readFile)(filePath);
            filesContent.push(JSON.parse(content));
        }
        catch (error) {
            console.error(`Error reading file ${fileName}:`, error);
            reject(error);
        }
    }
    resolve(filesContent);
});
exports.readFiles = readFiles;
const getConfigFile = async (url) => {
    try {
        const response = await (0, axios_1.default)(url, constants_1.GET_OPTIONS);
        return {
            ...response.data[0],
            repository: (0, exports.addRepositoryUrl)(url),
        };
    }
    catch (error) {
        const err = error;
        if (err.response && err.response.status === 404) {
            return null;
        }
        throw error;
    }
};
exports.getConfigFile = getConfigFile;
const addRepositoryUrl = (repositoryURL) => {
    const url = new URL(repositoryURL);
    const newUrl = `${url.protocol}//${url.hostname}${url.pathname.split('/').slice(0, 3).join('/')}`;
    console.log(newUrl);
    return newUrl;
};
exports.addRepositoryUrl = addRepositoryUrl;
const getConfigFiles = async (urls) => {
    const files = await Promise.all(urls.map((url) => (0, exports.getConfigFile)(url)));
    return files.filter((file) => file !== null);
};
exports.getConfigFiles = getConfigFiles;
const generateEapConfig = (config) => {
    const conf = {
        umlFile: `${config.repository}/raw/master/${config.eap}`,
        diagramName: config.diagram,
        specificationType: enum_1.SpecificationType[config.type],
        versionId: constants_1.VERSION_ID,
        publicationEnvironment: constants_1.PUBLICATION_ENVIRONMENT,
    };
    return conf;
};
exports.generateEapConfig = generateEapConfig;
//# sourceMappingURL=utils.js.map