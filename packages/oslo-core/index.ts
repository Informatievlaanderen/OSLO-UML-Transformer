import 'reflect-metadata';
// Extra manually added alias was required for nested NPM packages:
// https://github.com/ilearnio/module-alias?tab=readme-ov-file#using-within-another-npm-package

const moduleAlias = require('module-alias')

moduleAlias.addAliases({
    '@oslo-core': `${__dirname}/lib`,
})

export * from '@oslo-core/interfaces/AppRunner';
export * from '@oslo-core/interfaces/IConfiguration';
export * from '@oslo-core/interfaces/IOutputHandler';
export * from '@oslo-core/interfaces/IService';
export * from '@oslo-core/utils/fetchFileOrUrl';
export * from '@oslo-core/utils/namespaces';
export * from '@oslo-core/utils/uniqueId';
export * from '@oslo-core/store/QuadStore';
export * from '@oslo-core/ServiceIdentifier';
export * from '@oslo-core/enums/Scope';
export * from '@oslo-core/enums/PropertyTypes';
export * from '@oslo-core/logging/LogLevel';
export * from '@oslo-core/logging/Logger';
export * from '@oslo-core/logging/VoidLogger';
export * from '@oslo-core/logging/WinstonLogger';
export * from '@oslo-core/logging/LogUtil';
export * from '@oslo-core/logging/LoggerFactory';
export * from '@oslo-core/logging/VoidLoggerFactory';
export * from '@oslo-core/logging/WinstonLoggerFactory';
export * from '@oslo-core/utils/storeUtils';
