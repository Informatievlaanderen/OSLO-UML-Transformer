// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable no-sync */

import fs from 'fs';

export function ensureOutputDirectory(directory: string): void {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory);
  }
}
