/**
 * @group unit
 */
import type { Logger } from '@oslo-flanders/core';
import { DataRegistry } from '../lib/DataRegistry';
import { EaDiagram } from '../lib/types/EaDiagram';

describe('DataRegistry side diagrams', () => {
  let logger: Logger;
  let dataRegistry: DataRegistry;
  let main: EaDiagram;

  // A diagram in the given package with the given element and connector ids
  const createDiagram = (
    id: number,
    name: string,
    packageId: number,
    elementIds: number[],
    connectorsIds: number[],
  ): EaDiagram => {
    const diagram = new EaDiagram(id, name, `{guid-${id}}`, packageId);
    diagram.path = `Model:Package${packageId}:${name}`;
    diagram.elementIds = elementIds;
    diagram.connectorsIds = connectorsIds;
    return diagram;
  };

  beforeEach(() => {
    logger = <Logger>(<unknown>{ warn: jest.fn() });
    dataRegistry = new DataRegistry(logger);
    main = createDiagram(1, 'Main', 10, [1, 2], [100]);
    dataRegistry.diagrams = [
      main,
      createDiagram(2, 'Side', 20, [2, 3], [100, 200]),
      createDiagram(3, 'OtherSide', 30, [4], [300]),
    ];
  });

  it('should use the main diagram itself without side diagrams', () => {
    dataRegistry.setTargetDiagram('Main');

    expect(dataRegistry.targetDiagram).toBe(main);
  });

  it('should add the elements and connectors of a side diagram once', () => {
    dataRegistry.setTargetDiagram('Main', ['Side']);

    expect(dataRegistry.targetDiagram.elementIds).toEqual([1, 2, 3]);
    expect(dataRegistry.targetDiagram.connectorsIds).toEqual([100, 200]);
  });

  it('should keep the id, name, package and path of the main diagram', () => {
    dataRegistry.setTargetDiagram('Main', ['Side']);

    const target = dataRegistry.targetDiagram;
    expect(target.id).toBe(1);
    expect(target.name).toBe('Main');
    expect(target.packageId).toBe(10);
    expect(target.path).toBe('Model:Package10:Main');
    expect(target.osloGuid).toBe(main.osloGuid);
  });

  it('should not change the main diagram itself', () => {
    dataRegistry.setTargetDiagram('Main', ['Side']);

    expect(main.elementIds).toEqual([1, 2]);
    expect(main.connectorsIds).toEqual([100]);
  });

  it('should combine several side diagrams', () => {
    dataRegistry.setTargetDiagram('Main', ['Side', 'OtherSide']);

    expect(dataRegistry.targetDiagram.elementIds).toEqual([1, 2, 3, 4]);
    expect(dataRegistry.targetDiagram.connectorsIds).toEqual([100, 200, 300]);
  });

  it('should warn about and ignore the main diagram as side diagram', () => {
    dataRegistry.setTargetDiagram('Main', ['Main']);

    expect(dataRegistry.targetDiagram).toBe(main);
    expect(logger.warn).toHaveBeenCalledTimes(1);
  });

  it('should throw when a side diagram does not exist', () => {
    expect(() => dataRegistry.setTargetDiagram('Main', ['Missing'])).toThrow(
      'UML model does not contain a diagram with name Missing.',
    );
  });

  it('should throw when several diagrams share the name of a side diagram', () => {
    dataRegistry.diagrams = [
      ...dataRegistry.diagrams,
      createDiagram(4, 'Side', 40, [5], []),
    ];

    expect(() => dataRegistry.setTargetDiagram('Main', ['Side'])).toThrow(
      `Multiple diagrams share the same name 'Side'. Aborting conversion.`,
    );
  });
});
