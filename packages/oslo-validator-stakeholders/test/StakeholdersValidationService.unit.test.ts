/**
 * @group unit
 */
import 'reflect-metadata';
import * as path from 'path';
import { QuadStore, VoidLogger } from '@oslo-flanders/core';
import { DataFactory } from 'rdf-data-factory';
import { StakeholdersValidationServiceConfiguration } from '../lib/config/StakeholdersValidationServiceConfiguration';
import { StakeholdersValidationService } from '../lib/StakeholdersValidationService';

describe('StakeholdersValidationService', () => {
  describe('StakeholdersValidationServiceJSONPass', () => {
    let service: StakeholdersValidationService;
    let logger: VoidLogger;
    let config: StakeholdersValidationServiceConfiguration;
    let store: QuadStore;
    const df = new DataFactory();

    beforeEach(() => {
      logger = new VoidLogger();
      jest.spyOn(logger, 'info');
      jest.spyOn(logger, 'warn');
      jest.spyOn(logger, 'error');

      config = new StakeholdersValidationServiceConfiguration();
      (<any>config)._input = path.join(
        __dirname,
        'data',
        'stakeholders-pass.json',
      );
      (<any>config)._format = 'application/json';

      store = new QuadStore();

      service = new StakeholdersValidationService(logger, config, store);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('Format application/json', () => {
      it('should validate JSON output against JSONSchema and pass', async () => {
        await service.run();

        expect(logger.info).toHaveBeenCalledWith(
          "Stakeholder's JSON data is valid!",
        );
      });
    });
  });

  describe('StakeholdersValidationServiceJSONOVO', () => {
    let service: StakeholdersValidationService;
    let logger: VoidLogger;
    let config: StakeholdersValidationServiceConfiguration;
    let store: QuadStore;
    const df = new DataFactory();

    beforeEach(() => {
      logger = new VoidLogger();
      jest.spyOn(logger, 'info');
      jest.spyOn(logger, 'warn');
      jest.spyOn(logger, 'error');

      config = new StakeholdersValidationServiceConfiguration();
      (<any>config)._input = path.join(
        __dirname,
        'data',
        'stakeholders-ovo.json',
      );
      (<any>config)._format = 'application/json';

      store = new QuadStore();

      service = new StakeholdersValidationService(logger, config, store);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('Format application/json', () => {
      it('should validate JSON output against JSONSchema and log warning OVO code missing', async () => {
        await service.run();

        expect(logger.warn).toHaveBeenCalledWith(
          "Stakeholder does not have an OVO code: https://data.vlaanderen.be/doc/organisatie/0123456789",
        );
      });
    });
  });

  describe('StakeholdersValidationServiceJSONFail', () => {
    let service: StakeholdersValidationService;
    let logger: VoidLogger;
    let config: StakeholdersValidationServiceConfiguration;
    let store: QuadStore;
    const df = new DataFactory();

    beforeEach(() => {
      logger = new VoidLogger();
      jest.spyOn(logger, 'info');
      jest.spyOn(logger, 'warn');
      jest.spyOn(logger, 'error');

      config = new StakeholdersValidationServiceConfiguration();
      (<any>config)._input = path.join(
        __dirname,
        'data',
        'stakeholders-fail.json',
      );
      (<any>config)._format = 'application/json';

      store = new QuadStore();

      service = new StakeholdersValidationService(logger, config, store);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('Format application/json', () => {
      it('should validate JSON output against JSONSchema and fail', async () => {
        try {
          await service.run();
        } catch (error: unknown) {
          expect(error instanceof Error).toBe(true);
        }
      });
    });
  });

  describe('StakeholdersValidationServiceJSONLDPass', () => {
    let service: StakeholdersValidationService;
    let logger: VoidLogger;
    let config: StakeholdersValidationServiceConfiguration;
    let store: QuadStore;
    const df = new DataFactory();

    beforeEach(() => {
      logger = new VoidLogger();
      jest.spyOn(logger, 'info');
      jest.spyOn(logger, 'warn');
      jest.spyOn(logger, 'error');

      config = new StakeholdersValidationServiceConfiguration();
      (<any>config)._input = path.join(
        __dirname,
        'data',
        'stakeholders-pass.jsonld',
      );
      (<any>config)._format = 'application/ld+json';

      store = new QuadStore();

      service = new StakeholdersValidationService(logger, config, store);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('Format application/ld+json', () => {
      it('should validate JSON-LD output against JSONSchema and pass', async () => {
        await service.run();

        expect(logger.info).toHaveBeenCalledWith(
          "Stakeholder's JSON-LD data is valid!",
        );
      });
    });
  });

  describe('StakeholdersValidationServiceJSONLDFail', () => {
    let service: StakeholdersValidationService;
    let logger: VoidLogger;
    let config: StakeholdersValidationServiceConfiguration;
    let store: QuadStore;
    const df = new DataFactory();

    beforeEach(() => {
      logger = new VoidLogger();
      jest.spyOn(logger, 'info');
      jest.spyOn(logger, 'warn');
      jest.spyOn(logger, 'error');

      config = new StakeholdersValidationServiceConfiguration();
      (<any>config)._input = path.join(
        __dirname,
        'data',
        'stakeholders-fail.jsonld',
      );
      (<any>config)._format = 'application/ld+json';

      store = new QuadStore();

      service = new StakeholdersValidationService(logger, config, store);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('Format application/ld+json', () => {
      it('should validate JSON-LD output against JSONSchema and fail', async () => {
        try {
          await service.run();
        } catch (error: unknown) {
          expect(error instanceof Error).toBe(true);
        }
      });
    });
  });
});
