import fs from 'fs';

export function ensureOutputDirectory(directory: string): void {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory);
  }
}
