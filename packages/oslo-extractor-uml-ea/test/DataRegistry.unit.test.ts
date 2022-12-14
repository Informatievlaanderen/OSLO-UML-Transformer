/**
 * @group unit
 */
import { VoidLogger } from '@oslo-flanders/core';
import { DataRegistry } from '../lib/DataRegistry';
import { EaDiagram } from '../lib/types/EaDiagram';
import * as attributes from '../lib/utils/loadAttributes';
import * as diagrams from '../lib/utils/loadDiagrams';
import * as connectors from '../lib/utils/loadElementConnectors';
import * as elements from '../lib/utils/loadElements';
import * as packages from '../lib/utils/loadPackage';

describe('DataRegistry', () => {
  let dataRegistry: DataRegistry;

  beforeEach(() => {
    dataRegistry = new DataRegistry(new VoidLogger());
  });

  it('should throw an error when items in the data registry are not set', () => {
    expect(() => dataRegistry.diagrams).toThrowError();
    expect(() => dataRegistry.packages).toThrowError();
    expect(() => dataRegistry.attributes).toThrowError();
    expect(() => dataRegistry.elements).toThrowError();
    expect(() => dataRegistry.connectors).toThrowError();
    expect(() => dataRegistry.normalizedConnectors).toThrowError();
    expect(() => dataRegistry.targetDiagram).toThrowError();
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
    expect(() => dataRegistry.setTargetDiagram('NewTestDiagram')).toThrowError();
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

  it('should extract all the data from an UML diagram', async () => {
    const packageSpy = jest.spyOn(packages, 'loadPackages');
    const diagramSpy = jest.spyOn(diagrams, 'loadDiagrams');
    const elementSpy = jest.spyOn(elements, 'loadElements');
    const attributeSpy = jest.spyOn(attributes, 'loadAttributes');
    const connectorSpy = jest.spyOn(connectors, 'loadElementConnectors');

    // eslint-disable-next-line max-len
    await dataRegistry.extract('https://github.com/Informatievlaanderen/OSLO-UML-Transformer/blob/integration-test-files/oslo-converter-uml-ea/01-AssociatiesMijnDomein.EAP?raw=true');

    expect(packageSpy).toHaveBeenCalled();
    expect(elementSpy).toHaveBeenCalled();
    expect(diagramSpy).toHaveBeenCalled();
    expect(attributeSpy).toHaveBeenCalled();
    expect(connectorSpy).toHaveBeenCalled();
  });
});
