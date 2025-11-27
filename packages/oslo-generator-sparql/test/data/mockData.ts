export const mockSparqlParticipatie = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX cpov: <http://data.europa.eu/m8g/>
SELECT ?s ?rol WHERE {
  ?s rdf:type cpov:Participation.
  OPTIONAL { ?s cpov:role ?rol. }
}`;
export const mockSparqlAdresvoorstelling = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX locn: <http://www.w3.org/ns/locn#>
SELECT ?s ?busnummer WHERE {
  ?s rdf:type locn:Address.
  OPTIONAL { ?s <https://data.vlaanderen.be/ns/adres#busnummer> ?busnummer. }
}`;

export const mockInput = {
  '@context': {
    oslo: 'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#',
    owl: 'http://www.w3.org/2002/07/owl#',
    dcterms: 'http://purl.org/dc/terms/',
    rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
    skos: 'http://www.w3.org/2004/02/skos/core#',
    xsd: 'http://www.w3.org/2001/XMLSchema#',
    foaf: 'http://xmlns.com/foaf/0.1/',
    rec: 'http://www.w3.org/2001/02pd/rec54#',
    sh: 'http://www.w3.org/ns/shacl#',
    prov: 'http://www.w3.org/ns/prov#',
    adms: 'http://www.w3.org/ns/adms#',
    packages: '@included',
    classes: '@included',
    datatypes: '@included',
    attributes: '@included',
    referencedEntities: '@included',
    baseURI: {
      '@id': 'oslo:baseURI',
      '@type': '@id',
    },
    vocDefinition: {
      '@id': 'oslo:vocDefinition',
      '@container': '@set',
    },
    apDefinition: {
      '@id': 'oslo:apDefinition',
      '@container': '@set',
    },
    vocLabel: {
      '@id': 'oslo:vocLabel',
      '@container': '@set',
    },
    apLabel: {
      '@id': 'oslo:apLabel',
      '@container': '@set',
    },
    diagramLabel: {
      '@id': 'oslo:diagramLabel',
    },
    scope: {
      '@id': 'oslo:scope',
    },
    vocUsageNote: {
      '@id': 'oslo:vocUsageNote',
      '@container': '@set',
    },
    apUsageNote: {
      '@id': 'oslo:apUsageNote',
      '@container': '@set',
    },
    domain: {
      '@id': 'rdfs:domain',
      '@container': '@set',
    },
    range: {
      '@id': 'rdfs:range',
    },
    minCount: {
      '@id': 'sh:minCount',
    },
    maxCount: {
      '@id': 'sh:maxCount',
    },
    parent: {
      '@id': 'rdfs:subClassOf',
      '@type': 'owl:Class',
    },
    generatedAtTime: {
      '@id': 'prov:generatedAtTime',
    },
    Package: 'oslo:Package',
    Class: {
      '@id': 'owl:Class',
    },
    DatatypeProperty: {
      '@id': 'owl:DatatypeProperty',
    },
    ObjectProperty: {
      '@id': 'owl:ObjectProperty',
    },
    authors: {
      '@type': 'foaf:Person',
      '@id': 'foaf:maker',
    },
    editors: {
      '@type': 'foaf:Person',
      '@id': 'rec:editor',
    },
    contributors: {
      '@type': 'foaf:Person',
      '@id': 'dcterms:contributor',
    },
    affiliation: {
      '@id': 'http://schema.org/affiliation',
    },
    assignedURI: {
      '@id': 'oslo:assignedURI',
      '@type': '@id',
    },
    Datatype: {
      '@id': 'rdfs:Datatype',
    },
    codelist: {
      '@id': 'oslo:codelist',
      '@type': '@id',
    },
    status: {
      '@id': 'adms:status',
      '@type': '@id',
    },
    extensions: {
      '@id': 'oslo:extensions',
      '@container': '@set',
    },
  },
  '@id':
    'https://data.vlaanderen.be/doc/implementatiemodel/klantvolgsysteem1/ontwerpstandaard/2025-11-04',
  generatedAtTime: '2025-11-24T11:56:37.820Z',
  packages: [
    {
      '@id':
        'urn:oslo-toolchain:eb37ebe9c1520c79fcf03009c2d6beedc6c176c821082347a4cd8dae390cfaf2',
      '@type': 'Package',
      assignedURI: 'https://data.vlaanderen.be/ns/klantvolgsysteem',
      baseURI: 'https://data.vlaanderen.be/ns/klantvolgsysteem/',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
  ],
  classes: [
    {
      '@id':
        'urn:oslo-toolchain:77b8d897806e4b9812722f16da80e1aa5650621c0247afd0a6dcacd59d22594b',
      '@type': 'Class',
      assignedURI: 'http://data.europa.eu/m8g/Participation',
      apLabel: [
        {
          '@language': 'nl',
          '@value': 'Participatie',
        },
      ],
      diagramLabel: [
        {
          '@value': 'Participatie',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value':
            'De rol waarin een Agent deelneemt aan de Publieke Dienstverlening.',
        },
      ],
      scope: 'https://data.vlaanderen.be/id/concept/scope/External',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
  ],
  attributes: [
    {
      '@id':
        'urn:oslo-toolchain:6e1ab9c996ac0a32a4824004490553bc85d92b648305568d9df31f0716e87984',
      '@type': 'http://www.w3.org/2002/07/owl#ObjectProperty',
      assignedURI: 'http://data.europa.eu/m8g/role',
      apLabel: [
        {
          '@language': 'nl',
          '@value': 'rol',
        },
      ],
      diagramLabel: [
        {
          '@value': 'rol',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value': 'De functie van de Agent bij het deelnemen.',
        },
      ],
      domain: {
        '@id':
          'urn:oslo-toolchain:77b8d897806e4b9812722f16da80e1aa5650621c0247afd0a6dcacd59d22594b',
      },
      range: {
        '@id':
          'urn:oslo-toolchain:5be6177bce6b88114c9ed6e09320229ccdf93133001c1c8f9eb0cd04bdfebdca',
      },
      minCount: {
        '@value': '0',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      maxCount: {
        '@value': '*',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      scope: 'https://data.vlaanderen.be/id/concept/scope/External',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:51f7b6f59345d1a7dbb22285dc77ede1f0418c7714c3567b168b9cacf5fe4c51',
      '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
      assignedURI: 'https://data.vlaanderen.be/ns/adres#busnummer',
      vocLabel: [
        {
          '@language': 'nl',
          '@value': 'busnummer',
        },
      ],
      diagramLabel: [
        {
          '@value': 'busnummer',
        },
      ],
      vocDefinition: [
        {
          '@language': 'nl',
          '@value':
            'Officieel toegekende alfanumerieke code die wordt toegevoegd aan het huisnummer om meerdere gebouweenheden, standplaatsen, ligplaatsen of percelen te onderscheiden die eenzelfde huisnummer hebben.',
        },
      ],
      vocUsageNote: [
        {
          '@language': 'nl',
          '@value':
            'Specialisatie van Adresvoorstelling:locatieaanduiding ten behoeve van Belgische adressen.',
        },
      ],
      domain: {
        '@id':
          'urn:oslo-toolchain:00ba2bbf60d2dfaa285b345c16ca10a4ed645a18f5663eb227288c5aa4e960fd',
      },
      range: {
        '@id': 'urn:oslo-toolchain:487667944',
      },
      parent: {
        '@id': 'http://www.w3.org/ns/locn#locatorDesignator',
      },
      minCount: {
        '@value': '0',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      maxCount: {
        '@value': '1',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      scope:
        'https://data.vlaanderen.be/id/concept/scope/InPublicationEnvironment',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
  ],
  datatypes: [
    {
      '@id':
        'urn:oslo-toolchain:00ba2bbf60d2dfaa285b345c16ca10a4ed645a18f5663eb227288c5aa4e960fd',
      '@type': 'Datatype',
      assignedURI: 'http://www.w3.org/ns/locn#Address',
      apLabel: [
        {
          '@language': 'nl',
          '@value': 'Adresvoorstelling',
        },
      ],
      diagramLabel: [
        {
          '@value': 'Adresvoorstelling',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value':
            'Meer leesbare voorstelling met enkel de basisgegevens van het adres, bedoeld voor het gebruik van een adres als attribuut van een ander object.',
        },
      ],
      apUsageNote: [
        {
          '@language': 'nl',
          '@value':
            'Bijvoorbeeld als attribuut van een persoon of gebouw, ... De adresvoorstelling heeft niet enkel betrekking op Belgische adressen, ze kan gebruikt worden om buitenlandse adressen weer te geven (waar mogelijk andere adresaanduidingen dan huisnummer of busnummer worden gebruikt of waar adrescomponenten zoals adresgebieden voorkomen).',
        },
      ],
      scope: 'https://data.vlaanderen.be/id/concept/scope/External',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
  ],
};
