import type { IOutputHandler } from '@oslo-flanders/core';
import type { Store, Quad } from 'n3';

export class NQuadsOutputHandler implements IOutputHandler {
  public async write(store: Store<Quad>, writeStream: any): Promise<void> {
    console.log('This handler writes n-quads.');
  }
}
