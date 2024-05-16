import type { IEapConfig } from '../types/config';
export declare const generateCliCommand: (eapConfig: IEapConfig) => string;
export declare const runCommand: (command: string) => Promise<string>;
