import { SHA256 } from 'crypto-js';

export function uniqueId(guid: string, label: string, id: number): string {
  const object = {
    guid,
    label,
    id,
  };

  return SHA256(JSON.stringify(object)).toString();
}
