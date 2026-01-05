import type { CrossReferenceType } from '../enums/CrossReferenceType';
import { EaCrossReference } from '../types/EaCrossReference';

export function mapToEaCrossReference(
  data: any[],
  type: CrossReferenceType,
): EaCrossReference[] {
  const elements = data.map(
    (item) =>
      new EaCrossReference(
        <number>item.CrossReferenceId,
        <string>item.CrossReferenceName,
        <string>item.CrossReferenceEaGuid,
        <number>item.CrossReferencePackageId,
        <number>item.ChildAttributeId,
        <string>item.ChildAttributeName,
        <string>item.ChildAttributeEaGuid,
        <number>item.ParentAttributeId,
        <string>item.ParentAttributeName,
        <string>item.ParentAttributeEaGuid,
        type,
      ),
  );

  return elements;
}
