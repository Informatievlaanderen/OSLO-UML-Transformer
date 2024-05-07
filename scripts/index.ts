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
  createZipFromGithub,
  extractZip,
  generateEapConfig,
  getConfigFiles,
  listFiles,
  readFiles,
} from './utils/utils';

const run = async (): Promise<void> => {
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

  const promises: Promise<string>[] = commands.map((command) =>
    runCommand(command),
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
    console.error('Error during script:', error);
  });
