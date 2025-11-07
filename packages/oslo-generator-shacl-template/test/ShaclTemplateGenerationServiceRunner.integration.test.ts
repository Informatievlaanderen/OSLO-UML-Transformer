/**
 * @group integration
 */
import type { CliArgv } from '@oslo-flanders/core';
import { ShaclTemplateGenerationServiceRunner } from '../lib/ShaclTemplateGenerationServiceRunner';

describe('ShaclTemplateGenerationServiceRunner', () => {
  it('should generate a SHACL with inheritance', async () => {
    const argv: CliArgv = [
      '/usr/bin/node',
      '/bin/runner.js',
      '--input=test/data/cultureelErfgoedReport.jsonld',
      '--language=nl',
      '--outputFormat=text/turtle',
    ];
    const runner = new ShaclTemplateGenerationServiceRunner();
    await runner.runCli(argv);
  });
});
