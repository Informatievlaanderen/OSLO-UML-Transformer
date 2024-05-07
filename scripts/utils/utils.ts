import fs, { promises as fsPromises } from 'fs';
import https from 'https';
import path from 'path';
import axios from 'axios';
import extract from 'extract-zip';
import {
  GET_OPTIONS,
  PUBLICATION_ENVIRONMENT,
  VERSION_ID,
} from '../constants/constants';
import { SpecificationType } from '../constants/enum';
import type { IConfig, IEapConfig } from '../types/config';

export const extractZip = async (
  zipPath: string,
  destination: string,
): Promise<void> => {
  try {
    await extract(zipPath, { dir: destination });
    console.log('Extraction complete');
  } catch (error: unknown) {
    console.error('Error during extraction:', error);
  }
};

export const downloadFile = (url: string, dest: string): Promise<void> =>
  new Promise((resolve, reject) => {
    try {
      const file = fs.createWriteStream(dest);
      https.get(url, (response) => {
        // Extra check for redirect since the Github URL behind 'Download as zip' button is a redirect
        if (response.statusCode === 302 || response.statusCode === 301) {
          console.log(
            'Redirecting to new location',
            response?.headers?.location,
          );
          // Redirect - download from new location
          return downloadFile(response?.headers?.location ?? '', dest);
        }
        response.pipe(file);

        file.on('finish', () => {
          file.close();
          console.log('Download Completed');
          resolve();
        });

        file.on('error', (err: unknown) => {
          console.error('Error during download:', err);
          reject(err);
        });
      });
    } catch (error: unknown) {
      console.error('Error during download:', error);
      reject(error);
    }
  });

export const createZipFromGithub = async (
  url: string,
  pathName: string,
): Promise<void> => {
  try {
    await downloadFile(url, pathName);
  } catch (error: unknown) {
    console.error('Error during zip creation process:', error);
  }
};

export const listFiles = async (dir: string): Promise<string[]> =>
  new Promise((resolve, reject) => {
    fs.readdir(dir, (err, files) => {
      if (err) {
        console.error('Error during script:', err);
        reject(err);
      } else {
        resolve(files);
      }
    });
  });

export const readFile = async (filePath: string): Promise<string> =>
  new Promise(async (resolve, reject) => {
    try {
      const fileContent = await fs.promises.readFile(filePath, 'utf-8');
      resolve(fileContent);
    } catch (error: unknown) {
      console.error(`Error reading file ${filePath}:`, error);
      reject(error);
    }
  });

export const readFiles = async (
  dir: string,
  fileNames: string[],
): Promise<object[]> =>
  new Promise(async (resolve, reject) => {
    const filesContent: object[] = [];

    for (const fileName of fileNames) {
      const filePath = path.join(dir, fileName);
      try {
        const content = await readFile(filePath);
        filesContent.push(JSON.parse(content));
      } catch (error: unknown) {
        console.error(`Error reading file ${fileName}:`, error);
        reject(error);
      }
    }

    resolve(filesContent);
  });
export const getConfigFile = async (url: string): Promise<IConfig | null> => {
  try {
    const response = await axios<IConfig[]>(url, GET_OPTIONS);
    return {
      ...response.data[0],
      repository: addRepositoryUrl(url),
    };
  } catch (error: unknown) {
    const err = <{ response: { status: number } }>error;
    if (err.response && err.response.status === 404) {
      return null;
    }
    throw error;
  }
};
export const addRepositoryUrl = (repositoryURL: string): string => {
  const url = new URL(repositoryURL);
  const newUrl = `${url.protocol}//${url.hostname}${url.pathname.split('/').slice(0, 3).join('/')}`;
  console.log(newUrl);
  return newUrl;
};

export const getConfigFiles = async (
  urls: string[],
): Promise<(IConfig | null)[]> => {
  const files = await Promise.all(urls.map((url) => getConfigFile(url)));
  return files.filter((file) => file !== null);
};

export const generateEapConfig = (config: IConfig): IEapConfig => {
  const conf = {
    umlFile: `${config.repository}/raw/master/${config.eap}`,
    diagramName: config.diagram,
    specificationType: SpecificationType[config.type],
    versionId: VERSION_ID,
    publicationEnvironment: PUBLICATION_ENVIRONMENT,
  };
  return conf;
};

export const cleanup = async (
  zipPath: string,
  repoPath: string,
): Promise<void> => {
  try {
    await fsPromises.unlink(zipPath);
    console.log(`${zipPath} was deleted successfully.`);
  } catch (error: unknown) {
    console.error(`Error while deleting ${zipPath}.`, error);
  }

  try {
    await fsPromises.rmdir(repoPath, { recursive: true });
    console.log(`${repoPath} was deleted successfully.`);
  } catch (error: unknown) {
    console.error(`Error while deleting ${repoPath}.`, error);
  }
};
