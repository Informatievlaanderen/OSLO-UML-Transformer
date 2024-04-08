// Extra manually added alias was required for nested NPM packages:
// https://github.com/ilearnio/module-alias?tab=readme-ov-file#using-within-another-npm-package

const moduleAlias = require('module-alias')

moduleAlias.addAliases({
    '@oslo-extractor-uml-ea': `${__dirname}/lib`,
    "@oslo-core": `${__dirname}/node_modules/@oslo-flanders/core/lib`,
})

export * from '@oslo-extractor-uml-ea/DataRegistry';
export * from '@oslo-extractor-uml-ea/types/EaAttribute';
export * from '@oslo-extractor-uml-ea/types/EaConnector';
export * from '@oslo-extractor-uml-ea/types/NormalizedConnector';
export * from '@oslo-extractor-uml-ea/types/EaDiagram';
export * from '@oslo-extractor-uml-ea/types/EaElement';
export * from '@oslo-extractor-uml-ea/types/EaObject';
export * from '@oslo-extractor-uml-ea/types/EaPackage';
export * from '@oslo-extractor-uml-ea/types/EaTag';
export * from '@oslo-extractor-uml-ea/enums/ConnectorDirection';
export * from '@oslo-extractor-uml-ea/enums/ConnectorType';
export * from '@oslo-extractor-uml-ea/enums/EaTable';
export * from '@oslo-extractor-uml-ea/enums/ElementType';
export * from '@oslo-extractor-uml-ea/enums/NormalizedConnectorTypes';
