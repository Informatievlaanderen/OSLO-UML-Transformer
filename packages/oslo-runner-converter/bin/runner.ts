import type { OsloEaConverterConfiguration } from '@oslo-flanders/configuration';
import { OsloConverterRunner } from '../lib/OsloConverterRunner';
import { transformToEaConverterConfiguration } from '../lib/utils/utils';

const run = async (): Promise<void> => {
  const config: OsloEaConverterConfiguration = await transformToEaConverterConfiguration('./config/config.json');
  const runner: OsloConverterRunner = new OsloConverterRunner(config);

  await runner.init().then(() => runner.start());
};

run().catch(error => console.log(error));
