import type { IConfig, IEapConfig } from '../types/config';
export declare const extractZip: (zipPath: string, destination: string) => Promise<void>;
export declare const downloadFile: (url: string, dest: string) => Promise<void>;
export declare const createZipFromGithub: (url: string, pathName: string) => Promise<void>;
export declare const listFiles: (dir: string) => Promise<string[]>;
export declare const readFile: (filePath: string) => Promise<string>;
export declare const readFiles: (dir: string, fileNames: string[]) => Promise<object[]>;
export declare const getConfigFile: (url: string) => Promise<IConfig | null>;
export declare const addRepositoryUrl: (repositoryURL: string) => string;
export declare const getConfigFiles: (urls: string[]) => Promise<(IConfig | null)[]>;
export declare const generateEapConfig: (config: IConfig) => IEapConfig;
