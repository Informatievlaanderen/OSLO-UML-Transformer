import { stderr } from 'process';
import type { Container } from 'inversify';
import type { IConfiguration } from './IConfiguration';
import type { IService } from './IService';
import type { Logger } from '../logging/Logger';
import { createLogger, setLoggerFactory } from '../logging/LogUtil';
import { ServiceIdentifier } from '../ServiceIdentifier';
import yargs from 'yargs';

export type CliArgv = string[];

export type YargsParams =
  | {
      [x: string]: unknown;
      _: (string | number)[];
      $0: string;
    }
  | {
      [x: string]: unknown;
      _: (string | number)[];
      $0: string;
    };

export abstract class AppRunner<T extends IService, K extends IConfiguration> {
  protected createYargsInstance(argv: string[]): any {
    return yargs(argv)
      .parserConfiguration({
        'duplicate-arguments-array': false,
      })
      .usage('node ./bin/runner.js [args]');
  }

  public runCliSync(process: NodeJS.Process): void {
    this.runCli(process.argv).catch((error): never => {
      stderr.write(error.message);
      // eslint-disable-next-line unicorn/no-process-exit
      process.exit(1);
    });
  }

  public abstract runCli(argv: CliArgv): Promise<void>;

  public async startApp(
    params: YargsParams,
    container: Container,
  ): Promise<void> {
    const configuration = container.get<K>(ServiceIdentifier.Configuration);
    await configuration.createFromCli(params);

    setLoggerFactory(params);
    container
      .bind<Logger>(ServiceIdentifier.Logger)
      .toDynamicValue(() => createLogger())
      .inSingletonScope();

    const service = container.get<T>(ServiceIdentifier.Service);
    service
      .init()
      .then(() => service.run())
      .catch((error) => console.error(error));
  }
}
