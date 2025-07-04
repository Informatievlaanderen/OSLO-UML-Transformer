import type { IConfiguration, YargsParams } from '@oslo-flanders/core';
import { injectable } from 'inversify';

@injectable()
export class StakeholdersValidationServiceConfiguration implements IConfiguration {
  /**
   * Local path or URL of stakeholders file to validate
   */
  private _input: string | undefined;

  /**
   * Format of the stakeholders file, either application/json or application/ld+json
   */
  private _format: string | undefined;

  public async createFromCli(params: YargsParams): Promise<void> {
    this._input = <string>params.input;
    this._format = <string>params.format;
  }

  public get input(): string {
    if (!this._input) {
      throw new Error(`Trying to access property "input" before it was set.`);
    }
    return this._input;
  }

  public get format(): string {
    if (!this._format) {
      throw new Error(`Trying to access property "format" before it was set.`);
    }
    return this._format;
  }
}
