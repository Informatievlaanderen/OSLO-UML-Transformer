import { OsloEaConverterConfiguration } from '@oslo-flanders/configuration';
import { fetchFileOrUrl } from '@oslo-flanders/core';

export async function transformToEaConverterConfiguration(config: string): Promise<OsloEaConverterConfiguration> {
  const buffer = await fetchFileOrUrl(config);
  const data = JSON.parse(buffer.toString());

  return new OsloEaConverterConfiguration(
    data.umlFile,
    data.diagramName,
    data.outputFile,
    data.specificationType,
    data.targetDomain,
    data.documentId,
  );
}
