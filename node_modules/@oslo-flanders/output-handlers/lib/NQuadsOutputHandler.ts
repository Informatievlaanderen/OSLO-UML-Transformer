import type { IOutputHandler, QuadStore } from '@oslo-flanders/core';

export class NQuadsOutputHandler implements IOutputHandler {
  public async write(store: QuadStore, writeStream: any): Promise<void> {
    console.log('This handler writes n-quads.');
  }
}
