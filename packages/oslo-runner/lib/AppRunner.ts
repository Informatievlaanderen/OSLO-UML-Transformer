import { stderr } from 'process';
import { fetchFileOrUrl, getLoggerFor } from '@oslo-flanders/core';
import yargs from 'yargs';
import { ConverterApp } from './ConverterApp';
import { GeneratorApp } from './GeneratorApp';
import type { IApp } from './IApp';

export type CliArgv = string[];

export interface IAppRunnerArgs {
  appType: string;
  config: string;
}

export class AppRunner {
  private readonly logger = getLoggerFor(this);

  public runCliSync(process: NodeJS.Process): void {
    this.runCli(process.argv).catch((error): never => {
      this.logger.info(`Process exited due to one or more errors.`);
      stderr.write(error.message);
      // eslint-disable-next-line unicorn/no-process-exit
      process.exit(1);
    });
  }

  public async runCli(argv: CliArgv): Promise<void> {
    const app = await this.createCli(argv);

    try {
      await app.init().then(() => app.start());
    } catch (error: unknown) {
      this.logger.error(`App failed: ${error instanceof Error ? error.message : error}`);
    }
  }

  public async createCli(argv: CliArgv = process.argv): Promise<IApp> {
    const yargv = yargs(argv.slice(2))
      .usage('node ./bin/cli-runner.js [args]')
      .option('t', { alias: 'appType', describe: 'Type of the application: <converter> or <generator>' })
      .option('c', { alias: 'config', describe: 'Configuration file used to initialize the app.' })
      .help('h')
      .alias('h', 'help');

    const params = await yargv.parse();

    const appRunnerArgs: IAppRunnerArgs = {
      appType: <string>params.appType,
      config: <string>params.config,
    };

    if (!this.validArgs(appRunnerArgs)) {
      throw new Error('Unnable to create app due to invalid parameters.');
    }

    let appConfig;
    try {
      appConfig = JSON.parse((await fetchFileOrUrl(appRunnerArgs.config)).toString());
    } catch (error: unknown) {
      throw new Error(`Unnable to parse configuration file: ${error}.`);
    }

    return this.createApp(appRunnerArgs.appType, appConfig);
  }

  private validArgs(args: IAppRunnerArgs): boolean {
    if (!args.appType) {
      this.logger.error('No appType passed through cli.');
      return false;
    }

    if (!args.config) {
      this.logger.error('No config file passed through cli.');
      return false;
    }

    return true;
  }

  public createApp(appType: string, appConfig: any): IApp {
    switch (appType) {
      case 'converter':
        return new ConverterApp(appConfig);

      case 'generator':
        return new GeneratorApp(appConfig);

      default:
        throw new Error(`Unnable to create app for app type: ${appType}.`);
    }
  }
}
