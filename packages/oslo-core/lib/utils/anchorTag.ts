export function generateAnchorTag(
  entityLabel: string,
  propLabel?: string,
): string {
  const label = propLabel ? `${entityLabel}:${propLabel}` : entityLabel;
  const anchorHref = `${encodeURIComponent(label.replace(' ', ''))}`;
  return anchorHref;
}
