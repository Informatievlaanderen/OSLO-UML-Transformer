export function generateAnchorTag(
  entityLabel?: string,
  propLabel?: string,
): string {
  if (!entityLabel) return '';
  const label = propLabel ? `${entityLabel}:${propLabel}` : entityLabel;
  return encodeURIComponent(label.replace(/\s+/gu, ''));
}
