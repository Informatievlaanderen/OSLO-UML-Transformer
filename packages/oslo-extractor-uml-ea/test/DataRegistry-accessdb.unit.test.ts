/**
 * @group unit
 */
import { VoidLogger } from '@oslo-flanders/core';
import { InputFormat } from '@oslo-flanders/core/lib/enums/InputFormat';
import type { DataRegistry } from '../lib/DataRegistry';
import { FileReaderService } from '../lib/FileReaderService';
import { EaDiagram } from '../lib/types/EaDiagram';

describe('DataRegistry (accessdb)', () => {
  let dataRegistry: DataRegistry;

  beforeEach(async () => {
    dataRegistry = await new FileReaderService(
      InputFormat.AccessDB,
      new VoidLogger(),
    ).createDataRegistry(
      // eslint-disable-next-line max-len
      'https://github.com/Informatievlaanderen/OSLO-UML-Transformer/blob/8fa44ec84b901c60a70a64da3d1bb743c55d1aaf/oslo-converter-uml-ea/01-AssociatiesMijnDomein.EAP?raw=true',
    );
  });

  it('should return items when the default targetDiagram is set', () => {
    expect(dataRegistry.diagrams.length).toBe(1);
    expect(dataRegistry.packages.length).toBe(3);
    expect(dataRegistry.attributes.length).toBe(14);
    expect(dataRegistry.elements.length).toBe(35);
    expect(dataRegistry.connectors.length).toBe(24);
    expect(dataRegistry.crossReferences.length).toBe(3);
  });

  it('should return items when they are set', () => {
    dataRegistry.diagrams = [];
    expect(dataRegistry.diagrams).toStrictEqual([]);

    dataRegistry.packages = [];
    expect(dataRegistry.packages).toStrictEqual([]);

    dataRegistry.attributes = [];
    expect(dataRegistry.attributes).toStrictEqual([]);

    dataRegistry.elements = [];
    expect(dataRegistry.elements).toStrictEqual([]);

    dataRegistry.connectors = [];
    expect(dataRegistry.connectors).toStrictEqual([]);

    dataRegistry.normalizedConnectors = [];
    expect(dataRegistry.normalizedConnectors).toStrictEqual([]);

    dataRegistry.crossReferences = [];
    expect(dataRegistry.crossReferences).toStrictEqual([]);

    const mockDiagram = new EaDiagram(1, 'TestDiagram', 'guid', 1);

    dataRegistry.targetDiagram = mockDiagram;
    expect(dataRegistry.targetDiagram).toEqual(mockDiagram);
  });

  it('should be able to set the target diagram in the data registry', () => {
    const mockDiagram = new EaDiagram(1, 'TestDiagram', 'guid', 1);
    dataRegistry.diagrams = [mockDiagram];

    dataRegistry.setTargetDiagram('TestDiagram');

    expect(dataRegistry.targetDiagram).toEqual(mockDiagram);
  });

  it('should be able to set the target diagram in the data registry only once', () => {
    const mockDiagram = new EaDiagram(1, 'TestDiagram', 'guid', 1);
    const anotherMockDiagram = new EaDiagram(1, 'NewTestDiagram', 'guid', 1);
    dataRegistry.diagrams = [mockDiagram, anotherMockDiagram];

    dataRegistry.setTargetDiagram('TestDiagram');
    expect(() =>
      dataRegistry.setTargetDiagram('NewTestDiagram'),
    ).toThrowError();
  });

  it('should throw an error when a diagram can not be found set while setting the target diagram', () => {
    const mockDiagram = new EaDiagram(1, 'TestDiagram', 'guid', 1);
    dataRegistry.diagrams = [mockDiagram];

    expect(() => dataRegistry.setTargetDiagram('TargetDiagram')).toThrowError();
  });

  it('should throw an error when multiple diagrams with the same name are found', () => {
    const mockDiagram = new EaDiagram(1, 'TestDiagram', 'guid1', 1);
    const anotherMockDiagram = new EaDiagram(2, 'TestDiagram', 'guid2', 1);
    dataRegistry.diagrams = [mockDiagram, anotherMockDiagram];

    expect(() => dataRegistry.setTargetDiagram('TestDiagram')).toThrowError();
  });
});
