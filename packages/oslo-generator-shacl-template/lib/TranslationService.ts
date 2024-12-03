import { Logger } from '@oslo-flanders/core';
import { I18n } from 'i18n';
import { ShaclTemplateGenerationServiceIdentifier } from './config/ShaclTemplateGenerationServiceIdentifier';
import { inject, injectable } from 'inversify';
import { TranslationKey } from './enums/TranslationKey';
import { TranslationConfig } from './types/TranslationConfig';
import { Language } from '@oslo-flanders/core/lib/enums/Language';

@injectable()
export class TranslationService {
  public readonly logger: Logger;
  private readonly i18n: I18n;

  public constructor(
    @inject(ShaclTemplateGenerationServiceIdentifier.Logger) logger: Logger,
  ) {
    this.logger = logger;
    this.i18n = new I18n({
      locales: <string[]>Object.values(Language),
      directory: `${__dirname}/locales`,
      defaultLocale: 'nl',
    });
  }

  public translate(key: TranslationKey, config: TranslationConfig): string {
    return this.i18n.__mf(key, config);
  }
}
