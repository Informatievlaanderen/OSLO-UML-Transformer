import fs from 'fs';
import path from 'path';

import {
  ENVIRONMENT,
  GITHUB_REPO,
  REPO_NAME,
  ZIP_NAME,
} from './constants/constants';
import type { IConfig, IEapConfig, IPublication } from './types/config';
import { generateCliCommand, runCommand } from './utils/cli.utils';
import {
  cleanup,
  createZipFromGithub,
  extractZip,
  generateEapConfig,
  getConfigFiles,
  listFiles,
  readFiles,
} from './utils/utils';

const run = async (): Promise<void> => {
  console.log(`Validating EAP files for the ${ENVIRONMENT} environment...`);
  const targetPath = path.join(__dirname, './');
  const zipPath: string = path.join(__dirname, ZIP_NAME);
  const dir = path.join(
    __dirname,
    `${REPO_NAME}-${ENVIRONMENT}/config/${ENVIRONMENT}`,
  );

  await createZipFromGithub(GITHUB_REPO, zipPath);
  await extractZip(ZIP_NAME, targetPath);
  const files = await listFiles(dir);
  const content = await readFiles(dir, files);
  const publications: IPublication[] = <IPublication[]>content.flat();
  const urls = publications
    // If the config has a repository and a filename, we can build the URL
    .filter(
      (publication: IPublication) =>
        publication.repository && publication.filename,
    )
    .map(
      (publication: IPublication) =>
        `${publication.repository}/raw/master/${publication.filename}`,
    );
  // Only keep unique URLs
  const uniqueUrls = [...new Set(urls)];
  const configs: IConfig[] = <IConfig[]>await getConfigFiles(uniqueUrls);
  // Create config files that contain just the required parameters for the CLI
  const eapConfigs: IEapConfig[] = configs.map((config) =>
    generateEapConfig(config),
  );

  // Create the CLI command using the new eapConfig
  const commands: string[] = eapConfigs.map((eapConfig: IEapConfig) =>
    generateCliCommand(eapConfig),
  );

  const promises: Promise<string | void>[] = commands.map((command) =>
    runCommand(command).catch((error: unknown) => {
      if (!error) return;
      const errorMessage = `Command: ${command} \n ${<Error>error}\n`;

      fs.appendFile('error.log', errorMessage, (err) => {
        if (err) {
          console.error(`Failed to write to log file: ${err.message}`);
        }
      });
    }),
  );
  await Promise.all(promises);
};

run()
  .then(() => {
    console.log(
      `All EAP files have been validated for the ${ENVIRONMENT} environment.`,
    );
  })
  .catch((error: unknown) => {
    const errorMessage = `Error during script: ${error}\n`;
    fs.appendFile('error.log', errorMessage, (err) => {
      if (err) {
        console.error(`Failed to write to log file: ${err.message}`);
      }
    });
  })
  .finally(async () => {
    console.log('Cleaning up...');
    const zipPath: string = path.join(__dirname, ZIP_NAME);
    const dir = path.join(__dirname, `${REPO_NAME}-${ENVIRONMENT}`);
    await cleanup(zipPath, dir);

    console.log('Script finished.');
  });
