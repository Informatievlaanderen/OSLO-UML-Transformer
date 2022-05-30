// TODO: this should be a hash based on guid + label and id
export function uniqueId(): string {
  return (Date.now() * Math.random()).toString(36).replace('.', '');
}
