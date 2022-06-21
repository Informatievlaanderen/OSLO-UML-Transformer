import type { Readable } from 'stream';
import type { OsloLdesMember } from '../oslo/OsloLdesMember';

export interface LdesWritableConnector {
  /**
   * Stream from which the Ldes member will be read
   */
  memberStream: Readable;

  /**
   * Writes a version to the corresponding backend system
   * @param member - The member the must be written to the backend
   */
  writeVersion: (member: OsloLdesMember) => Promise<void>;

  /**
   * Initializes the backend system by creating tables, counters and/or enabling plugins
   */
  init: (stream: Readable) => Promise<void>;

  /**
   * Stop asynchronous operations
   */
  stop: () => Promise<void>;
}
