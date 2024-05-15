import { exec } from 'child_process';
import type { IEapConfig } from '../types/config';

export const generateCliCommand = (eapConfig: IEapConfig): string =>
  `oslo-converter-ea --umlFile ${eapConfig.umlFile} --diagramName ${eapConfig.diagramName} --specificationType ${eapConfig.specificationType} --versionId ${eapConfig.versionId} --publicationEnvironment ${eapConfig.publicationEnvironment}`;

export const runCommand = (command: string): Promise<string> =>
  new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (stderr || error) {
        const stderrLines = stderr.split('\n');
        if (stderrLines[0].includes('TypeError')) {
          reject(
            new Error(
              `${stderrLines[0]}\n ${stderrLines[9]}\n ${stderrLines[10]}`,
            ),
          );
        } else {
          reject(new Error(stderrLines[0]));
        }
      }
      resolve(stdout);
    });
  });
