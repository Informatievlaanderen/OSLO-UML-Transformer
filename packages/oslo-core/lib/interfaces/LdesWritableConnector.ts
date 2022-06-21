import type { OsloLdesMember } from '../oslo/OsloLdesMember';

export interface LdesWritableConnector<T> {
  /**
   * Writes a version to the corresponding backend system
   * @param member - The member the must be written to the backend
   */
  writeVersion: (member: Partial<OsloLdesMember>) => Promise<void>;

  /**
   * Initializes the backend system by creating tables, counters and/or enabling plugins
   */
  init: (config: T) => Promise<void>;

  /**
   * Stop asynchronous operations
   */
  stop: () => Promise<void>;
}
