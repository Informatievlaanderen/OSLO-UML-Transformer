import { exec } from 'child_process';
import type { IEapConfig } from '../types/config';

export const generateCliCommand = (eapConfig: IEapConfig): string =>
  `oslo-converter-ea --umlFile ${eapConfig.umlFile} --diagramName ${eapConfig.diagramName} --specificationType ${eapConfig.specificationType} --versionId ${eapConfig.versionId} --publicationEnvironment ${eapConfig.publicationEnvironment} --verbose`;

export const runCommand = (command: string): Promise<string> =>
  new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
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
