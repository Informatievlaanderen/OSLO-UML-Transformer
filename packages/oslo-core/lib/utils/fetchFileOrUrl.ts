import { existsSync } from 'fs';
import { readFile, stat } from 'fs/promises';
const fetch = require('node-fetch');

export async function fetchFileOrUrl(file: string): Promise<Buffer> {
  if (file.startsWith('http://') || file.startsWith('https://')) {
    return (await fetch(file)).buffer();
  }

  if (file.startsWith('file://')) {
    file = file.slice(7);
  }

  if (!existsSync(file) || !(await stat(file)).isFile()) {
    throw new Error(`Path does not refer to a valid file: ${file}`);
  }

  return readFile(file);
}