import { stderr } from "process";

export type CliArgv = string[];

export type YargsParams = {
  [x: string]: unknown;
  _: (string | number)[];
  $0: string;
} | {
  [x: string]: unknown;
  _: (string | number)[];
  $0: string;
}

export abstract class AppRunner {
  public runCliSync(process: NodeJS.Process): void {
    this.runCli(process.argv).catch((error): never => {
      stderr.write(error.message);
      // eslint-disable-next-line unicorn/no-process-exit
      process.exit(1);
    });
  }

  public abstract runCli(argv: CliArgv): Promise<void>;
}