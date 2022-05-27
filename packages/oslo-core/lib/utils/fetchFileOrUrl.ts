import { readFile, stat } from 'fs/promises';

// eslint-disable-next-line import/no-commonjs
const fetch = require('node-fetch');

export async function fetchFileOrUrl(file: string): Promise<Buffer> {
  if (file.startsWith('http://') || file.startsWith('https://')) {
    return (await fetch(file)).buffer();
  }

  if (file.startsWith('file://')) {
    file = file.slice(7);
  }

  if (!(await stat(file)).isFile()) {
    throw new Error(`Path does not refer to a valid file: ${file}`);
  }

  return readFile(file);
}