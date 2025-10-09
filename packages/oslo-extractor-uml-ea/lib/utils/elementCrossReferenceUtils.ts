import type { CrossReferenceType } from '../enums/CrossReferenceType';
import { EaCrossReference } from '../types/EaCrossReference';

export function mapToEaCrossReference(
  data: any[],
  type: CrossReferenceType,
): EaCrossReference[] {
  const elements = data.map(
    (item) =>
      new EaCrossReference(
        <number>item.AttributeId,
        <string>item.AttributeName,
        <string>item.AttributeEaGuid,
        <string>item.ParentGuid,
        <number>item.PackageId,
        type,
      ),
  );

  return elements;
}
