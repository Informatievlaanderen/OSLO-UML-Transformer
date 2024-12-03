/**
 * @group unit
 */
import 'reflect-metadata';
import { VoidLogger } from '@oslo-flanders/core';
import type { Logger } from '@oslo-flanders/core';
import { Language } from '@oslo-flanders/core/lib/enums/Language';
import { I18n } from 'i18n';
import { TranslationKey } from '../lib/enums/TranslationKey';
import { TranslationService } from '../lib/TranslationService';
import type { TranslationConfig } from '../lib/types/TranslationConfig';

describe('TranslationService', () => {
  let service: TranslationService;
  let logger: Logger;
  let i18n: I18n;

  beforeEach(() => {
    // Initialize your dependencies here
    logger = new VoidLogger();
    service = new TranslationService(logger);

    i18n = new I18n({
      locales: <string[]>Object.values(Language),
      directory: `${__dirname}/../lib/locales`,
      defaultLocale: 'nl',
    });
  });

  it('should translate a key', () => {
    const key: TranslationKey = TranslationKey.CodelistConstraint;
    const config: TranslationConfig = {
      label: 'SubjectLabel',
      codelist: 'SubjectCodelist',
    };

    // This assumes that you have a way to spy on the `__mf` method of the i18n instance
    const __mfSpy = jest.spyOn((<any>service).i18n, '__mf');
    const translatedString = service.translate(key, config);

    // Check if the `__mf` method of the i18n instance was called with the correct arguments
    expect(__mfSpy).toHaveBeenCalledWith(key, config);

    // Check if the `translate` method returned the correct value
    // This assumes that the `__mf` method of the i18n instance returns a string
    expect(translatedString).toBe(i18n.__mf(key, config));
  });
});
