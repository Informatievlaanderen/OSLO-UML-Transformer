import type { Database as SqliteDatabase } from "better-sqlite3";
import type MDBReader from "mdb-reader/lib/types/MDBReader";
import { IFileReader } from "./interfaces/IFileReader";
import { Logger } from "@oslo-flanders/core";
import { DataRegistry } from "./DataRegistry";
import { AccessDbFileReader } from "./AccessDbFileReader";
import { SqliteFileReader } from "./SqliteFileReader";

export class FileReaderService<T extends MDBReader & SqliteDatabase> {
  private readonly fileReader: IFileReader<T>;
  public readonly logger: Logger;

  public constructor(format: string, logger: Logger) {
    this.logger = logger;
    this.fileReader = this.createFileReader(format);
  }

  public async createDataRegistry(file: string): Promise<DataRegistry> {
    const dataRegistry = new DataRegistry(this.logger)
    return this.fileReader.initDataRegistry(file, dataRegistry);
  }

  private createFileReader(format: string): IFileReader<T> {
    switch (format) {
      case 'accessdb':
        return new AccessDbFileReader();

      case 'sqlite':
        return new SqliteFileReader();

      default:
        throw new Error(`Format "${format}" not supported.`);
    }
  }
}