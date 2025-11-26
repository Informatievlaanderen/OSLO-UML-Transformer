export const kvsInput = {
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
    {
      '@id':
        'urn:oslo-toolchain:69541edab103f9ac8141e94644252c6e933e92f30861a7f4bb74659f9f1754f1',
      '@type': 'Class',
      assignedURI: 'https://data.vlaanderen.be/ns/persoon#Verblijfplaats',
      vocLabel: [
        {
          '@language': 'nl',
          '@value': 'Verblijfplaats',
        },
      ],
      diagramLabel: [
        {
          '@value': 'Verblijfplaats',
        },
      ],
      vocDefinition: [
        {
          '@language': 'nl',
          '@value':
            'Plaats waar een Persoon al dan niet tijdelijk woont of logeert.',
        },
      ],
      scope:
        'https://data.vlaanderen.be/id/concept/scope/InPublicationEnvironment',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:92607a4802f2d1e74b18cdfa61849c2fa3f310a0a59c69a4ef8ba9e64b51e1db',
      '@type': 'Class',
      assignedURI: 'https://data.vlaanderen.be/ns/persoon#Inwonerschap',
      vocLabel: [
        {
          '@language': 'nl',
          '@value': 'Inwonerschap',
        },
      ],
      diagramLabel: [
        {
          '@value': 'Inwonerschap',
        },
      ],
      vocDefinition: [
        {
          '@language': 'nl',
          '@value':
            'Het feit dat een Persoon verblijf houdt in een plaats of land.',
        },
      ],
      scope:
        'https://data.vlaanderen.be/id/concept/scope/InPublicationEnvironment',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:66bcc61cd2cd05f365bc924932cccb2d9a0eba7d7680ce7b928ecb1b5f1c69c5',
      '@type': 'Class',
      assignedURI: 'https://data.vlaanderen.be/ns/persoon#GeregistreerdPersoon',
      vocLabel: [
        {
          '@language': 'nl',
          '@value': 'Geregistreerd Persoon',
        },
      ],
      diagramLabel: [
        {
          '@value': 'Geregistreerd Persoon',
        },
      ],
      vocDefinition: [
        {
          '@language': 'nl',
          '@value':
            'Persoon waarvan de gegevens zijn ingeschreven in een register.',
        },
      ],
      vocUsageNote: [
        {
          '@language': 'nl',
          '@value':
            'Doorgaans is dit register een bevolkingsregister maar het kan bv ook een kiesregister zijn. De ingeschreven gegevens hebben betrekking op de identeit (vb naam en voornaam) en de Verblijfplaats vd persoon en op belangrijke levensgebeurtenissen zoals geboorte, huwelijk, overlijden etc. Deze gegevens worden typisch geregistreerd door de overheid, ze bieden de ingeschreven persoon wettelijke bescherming en laten de overheid toe om basisstatistieken op te stellen over zijn bevolking.',
        },
      ],
      scope:
        'https://data.vlaanderen.be/id/concept/scope/InPublicationEnvironment',
      parent: [
        {
          '@id':
            'urn:oslo-toolchain:b954552fd64a110b7edc2539cd01dee3687f9bb38e0fb0fd6c9ae68249b2406d',
        },
      ],
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:b954552fd64a110b7edc2539cd01dee3687f9bb38e0fb0fd6c9ae68249b2406d',
      '@type': 'Class',
      assignedURI: 'http://xmlns.com/foaf/0.1/Agent',
      apLabel: [
        {
          '@language': 'nl',
          '@value': 'Agent',
        },
      ],
      diagramLabel: [
        {
          '@value': 'Agent',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value':
            'Een agent zoals een Persoon, groep, software of fysiek artifact.',
        },
      ],
      apUsageNote: [
        {
          '@language': 'nl',
          '@value': 'Te vervangen door een niet-abstracte klasse.',
        },
      ],
      scope: 'https://data.vlaanderen.be/id/concept/scope/External',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:bb8f9ffb4f67f96b7a5716f5ea6f64c3a546ddb867ba0998a1a976d5e62ee555',
      '@type': 'Class',
      assignedURI: 'https://data.vlaanderen.be/ns/persoon#Domicilie',
      vocLabel: [
        {
          '@language': 'nl',
          '@value': 'Domicilie',
        },
      ],
      diagramLabel: [
        {
          '@value': 'Domicilie',
        },
      ],
      vocDefinition: [
        {
          '@language': 'nl',
          '@value': 'Hoofdverblijfplaats van een Persoon.',
        },
      ],
      vocUsageNote: [
        {
          '@language': 'nl',
          '@value':
            'Plaats waar de Persoon het grootste deel van de tijd verblijft binnen de jurisdictie waarvan hij Inwoner is. Dit wordt doorgaans officieel vastgesteld en geregistreerd ih bevolkingsregister. Kan in praktijk verschillend zijn van de feitelijke verblijfplaats.',
        },
      ],
      scope:
        'https://data.vlaanderen.be/id/concept/scope/InPublicationEnvironment',
      parent: [
        {
          '@id':
            'urn:oslo-toolchain:69541edab103f9ac8141e94644252c6e933e92f30861a7f4bb74659f9f1754f1',
        },
      ],
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:89d54c9cf862cd83e7631a79373d0a3a4edd877682e7714ca1bea09ebf951057',
      '@type': 'Class',
      assignedURI: 'http://www.w3.org/ns/person#Person',
      vocLabel: [
        {
          '@language': 'nl',
          '@value': 'Persoon',
        },
      ],
      diagramLabel: [
        {
          '@value': 'Persoon',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value': 'Natuurlijk persoon.',
        },
      ],
      apUsageNote: [
        {
          '@language': 'nl',
          '@value':
            'In de rechtspraak betreft het een persoon (in de wettelijke betekenis, ttz met eigen rechtspersoonlijkheid) van de menselijke soort, ttz een fysiek persoon. Tegenhanger is de rechtspersoon, een juridische constructie die een private of publieke organisatie dezelfde rechtspersoonlijkheid geeft als een natuurlijk persoon (kan bv ook schulden hebben, contracten afsluiten, aangeklaagd worden etc).',
        },
      ],
      scope: 'https://data.vlaanderen.be/id/concept/scope/External',
      parent: [
        {
          '@id':
            'urn:oslo-toolchain:b954552fd64a110b7edc2539cd01dee3687f9bb38e0fb0fd6c9ae68249b2406d',
        },
      ],
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:8a9d72ed86bf3c9730f5303b7b0306060d960614d9b5a929fb693b29627cd278',
      '@type': 'Class',
      assignedURI:
        'https://data.vlaanderen.be/ns/klantvolgsysteem1/Werkvoorkeuren',
      vocLabel: [
        {
          '@language': 'nl',
          '@value': 'Werkvoorkeuren',
        },
      ],
      diagramLabel: [
        {
          '@value': 'Werkvoorkeuren',
        },
      ],
      vocDefinition: [
        {
          '@language': 'nl',
          '@value':
            'De voorkeuren van de Werkzoekende bij het zoeken naar werk.',
        },
      ],
      scope:
        'https://data.vlaanderen.be/id/concept/scope/InPublicationEnvironment',
      parent: [
        {
          '@id':
            'urn:oslo-toolchain:ca8204c2e2bad8aed9e83ab223edd70b07450b5a22caf3ce4fbcaf885a5ea881',
        },
      ],
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:61f069ee039fbc00d3aa41c20389c8de1411f5b89d470448a18e51c185fb96b0',
      '@type': 'Class',
      assignedURI: 'http://purl.org/dc/terms/Location',
      apLabel: [
        {
          '@language': 'nl',
          '@value': 'Plaats',
        },
      ],
      diagramLabel: [
        {
          '@value': 'Plaats',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value': 'Een ruimtelijk gebied of benoemde plaats.',
        },
      ],
      scope: 'https://data.vlaanderen.be/id/concept/scope/External',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:f59bbf9085f552b332bb7960f6d7215dbf82fe1a3ec10f9d33a33653719b8690',
      '@type': 'Class',
      assignedURI:
        'https://data.vlaanderen.be/ns/klantvolgsysteem1/Activeringstraject',
      vocLabel: [
        {
          '@language': 'nl',
          '@value': 'Activeringstraject',
        },
      ],
      diagramLabel: [
        {
          '@value': 'Activeringstraject',
        },
      ],
      vocDefinition: [
        {
          '@language': 'nl',
          '@value':
            'Een Activeringstraject is een specifiekere variant van een Traject dat moet aansporen om de Werkzoekende te activeren naar werk.',
        },
      ],
      scope:
        'https://data.vlaanderen.be/id/concept/scope/InPublicationEnvironment',
      parent: [
        {
          '@id':
            'urn:oslo-toolchain:79a176236964bafa9776d3abe8e8a2548de5051589fa42e9ea6f38a5e1886dc8',
        },
      ],
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:f87a934b403eae4bb15f4f55885d7d53b68103adcd814c47c0b75b45eb3b04ba',
      '@type': 'Class',
      assignedURI:
        'https://data.vlaanderen.be/ns/klantvolgsysteem1/Deeltraject',
      vocLabel: [
        {
          '@language': 'nl',
          '@value': 'Deeltraject',
        },
      ],
      diagramLabel: [
        {
          '@value': 'Deeltraject',
        },
      ],
      vocDefinition: [
        {
          '@language': 'nl',
          '@value':
            'Een Deeltraject is een onderdeel van een Traject dat een specfiek onderdeel uitwerkt van een Traject.',
        },
      ],
      apUsageNote: [
        {
          '@language': 'nl',
          '@value': 'Bijvoorbeeld: een opleiding.',
        },
      ],
      scope:
        'https://data.vlaanderen.be/id/concept/scope/InPublicationEnvironment',
      parent: [
        {
          '@id':
            'urn:oslo-toolchain:79a176236964bafa9776d3abe8e8a2548de5051589fa42e9ea6f38a5e1886dc8',
        },
      ],
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:00ce2e972f4fc32705be1f51218aee12b33184f3b015ac3b7b07dbe8b3aa93ef',
      '@type': 'Class',
      assignedURI: 'http://www.w3.org/ns/regorg#RegisteredOrganization',
      apLabel: [
        {
          '@language': 'nl',
          '@value': 'Geregistreerde Organisatie',
        },
      ],
      diagramLabel: [
        {
          '@value': 'Geregistreerde Organisatie',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value':
            'Organisatie met een juridisch statuut vastgelegd door registratie. Vergelijk met een FormeleOrganisatie waarbij dit statuut ook op een andere manier verkregen kan zijn.',
        },
      ],
      apUsageNote: [
        {
          '@language': 'nl',
          '@value':
            'In België moeten onder andere volgende Organisaties zich registreren: vennootschap (NV, BV, etc), eenmanszaak, overheidsorgaan, stichting, … Bij registratie krijgt de Organisatie een ondernemingsnummer en worden zijn gegevens ingevoerd in de Kruispuntbank van Ondernemingen (KBO).',
        },
      ],
      scope: 'https://data.vlaanderen.be/id/concept/scope/External',
      parent: [
        {
          '@id':
            'urn:oslo-toolchain:b954552fd64a110b7edc2539cd01dee3687f9bb38e0fb0fd6c9ae68249b2406d',
        },
      ],
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:c72f59f8d3fcebdebf32c8e5f5c0f40390e271b0becde64d562779120e39f3db',
      '@type': 'Class',
      assignedURI: 'http://data.europa.eu/m8g/PublicOrganisation',
      apLabel: [
        {
          '@language': 'nl',
          '@value': 'PubliekeOrganisatie',
        },
      ],
      diagramLabel: [
        {
          '@value': 'PubliekeOrganisatie',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value':
            'Een Organisatie die volgens een wettelijk kader behoort tot de publieke sector, ongeacht het bestuursniveau waarop dat kader van kracht is.',
        },
      ],
      apUsageNote: [
        {
          '@language': 'nl',
          '@value':
            'De overheids- en semioverheidsorganisaties die tot men zo tot de publieke sector kan rekenen worden in Europese richtlijn 2003/98/EG "openbaar lichaam" genoemd en gedefinieerd als: "de staat, zijn territoriale lichamen, publiekrechtelijke instellingen, en verenigingen gevormd door een of meer van deze lichamen of een of meer van deze publiekrechtelijke instellingen". En onder een publiekrechtelijke instelling verstaat men " iedere instelling die a) is opgericht met het specifieke doel te voorzien in behoeften van algemeen belang die niet van industriële of commerciële aard zijn, en b) rechtspersoonlijkheid heeft, en c) waarvan hetzij de activiteiten in hoofdzaak door de staat of zijn territoriale lichamen of andere publiekrechtelijke instellingen worden gefinancierd, hetzij het beheer is onderworpen aan toezicht door deze laatste, hetzij de leden van het bestuursorgaan, het leidinggevend orgaan of het toezichthoudend orgaan voor meer dan de helft door de staat, zijn territoriale lichamen of andere publiekrechtelijke instellingen zijn aangewezen.".',
        },
      ],
      scope: 'https://data.vlaanderen.be/id/concept/scope/External',
      parent: [
        {
          '@id':
            'urn:oslo-toolchain:b954552fd64a110b7edc2539cd01dee3687f9bb38e0fb0fd6c9ae68249b2406d',
        },
      ],
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:132869bbcca79d7380ce27f3d36f3b33249be46d6db0ab4b60c6d0f2fb913023',
      '@type': 'Class',
      assignedURI: 'http://purl.org/vocab/cpsv#PublicService',
      apLabel: [
        {
          '@language': 'nl',
          '@value': 'PubliekeDienstverlening',
        },
      ],
      diagramLabel: [
        {
          '@value': 'PubliekeDienstverlening',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value':
            'Een publieke dienstverlening is een geheel van verplichte of optioneel uitgevoerde of uitvoerbare acties door of in naam van een publieke organisatie. De dienstverlening is ten bate van een individu, een bedrijf, een andere publieke organisatie of groepen.',
        },
      ],
      apUsageNote: [
        {
          '@language': 'nl',
          '@value':
            'De dienstverlening vormt een aanbod (dat dus niet noodzakelijk wordt gebruikt). Ze houdt niet noodzakelijk het opnemen van een recht in,de dienstverlening kan de gebruiker ook toelaten een verplichting te vervullen.',
        },
      ],
      scope: 'https://data.vlaanderen.be/id/concept/scope/External',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:36e49157a1e6cdf420adf00f611b59963b23ef7c0d510806928958a901ec7862',
      '@type': 'Class',
      assignedURI: 'http://purl.org/vocab/bio/0.1/Birth',
      apLabel: [
        {
          '@language': 'nl',
          '@value': 'Geboorte',
        },
      ],
      diagramLabel: [
        {
          '@value': 'Geboorte',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value': 'Het ter wereld komen van een Persoon.',
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
        'urn:oslo-toolchain:0454ece5ef83b30cfbb573a864256bc193934734be462e3709905cabe1655514',
      '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
      assignedURI: 'http://www.w3.org/2004/02/skos/core#notation',
      vocLabel: [
        {
          '@language': 'nl',
          '@value': 'notatie',
        },
      ],
      apLabel: [
        {
          '@language': 'nl',
          '@value': 'identificator',
        },
      ],
      diagramLabel: [
        {
          '@value': 'identificator',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value': 'String gebruikt om het object uniek te identificeren.',
        },
      ],
      apUsageNote: [
        {
          '@language': 'nl',
          '@value':
            'Type vd string slaat op het identificatiesysteem (incl de versie ervan), de string zelf op de eigenlijke identificator.',
        },
      ],
      domain: {
        '@id':
          'urn:oslo-toolchain:06f6ee61443d1a73c88124b66f4c65776e7b1a9ec02c4e5abd2764932a842e08',
      },
      range: {
        '@id': 'urn:oslo-toolchain:2049156247',
      },
      minCount: {
        '@value': '0',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      maxCount: {
        '@value': '1',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      scope: 'https://data.vlaanderen.be/id/concept/scope/External',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:4c4287dcfd9a9d86cb7f96297054cde81f31e965fa58a9cfc4f8de4f39fe4e46',
      '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
      assignedURI: 'http://purl.org/dc/terms/title',
      apLabel: [
        {
          '@language': 'nl',
          '@value': 'naam',
        },
      ],
      diagramLabel: [
        {
          '@value': 'naam',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value': 'De naam van een Traject.',
        },
      ],
      domain: {
        '@id':
          'urn:oslo-toolchain:f59bbf9085f552b332bb7960f6d7215dbf82fe1a3ec10f9d33a33653719b8690',
      },
      range: {
        '@id': 'urn:oslo-toolchain:1727880001',
      },
      minCount: {
        '@value': '1',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      maxCount: {
        '@value': '1',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      scope: 'https://data.vlaanderen.be/id/concept/scope/External',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:cdc8c1b011e4b92be9973c15f4b8ae34ca7451547d172aec49ffe4819e0d32a6',
      '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
      assignedURI: 'http://www.w3.org/ns/adms#schemaAgency',
      vocLabel: [
        {
          '@language': 'nl',
          '@value': 'schema agentschap',
        },
      ],
      apLabel: [
        {
          '@language': 'nl',
          '@value': 'toegekend Door (String)',
        },
      ],
      diagramLabel: [
        {
          '@value': 'toegekend Door (String)',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value': 'Naam vd agent die de identificator heeft toegekend.',
        },
      ],
      domain: {
        '@id':
          'urn:oslo-toolchain:06f6ee61443d1a73c88124b66f4c65776e7b1a9ec02c4e5abd2764932a842e08',
      },
      range: {
        '@id': 'urn:oslo-toolchain:487667944',
      },
      minCount: {
        '@value': '0',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      maxCount: {
        '@value': '1',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      scope: 'https://data.vlaanderen.be/id/concept/scope/External',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:a2519aaad5f193d4d89815eed290a27843d452a0dec94a032ff371826da09c77',
      '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
      assignedURI: 'http://purl.org/dc/terms/issued',
      vocLabel: [
        {
          '@language': 'nl',
          '@value': 'uitgegeven',
        },
      ],
      apLabel: [
        {
          '@language': 'nl',
          '@value': 'toegekendOp',
        },
      ],
      diagramLabel: [
        {
          '@value': 'toegekendOp',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value': 'Tijdstip waarop de identificator werd uitgegeven.',
        },
      ],
      domain: {
        '@id':
          'urn:oslo-toolchain:06f6ee61443d1a73c88124b66f4c65776e7b1a9ec02c4e5abd2764932a842e08',
      },
      range: {
        '@id': 'urn:oslo-toolchain:499715870',
      },
      minCount: {
        '@value': '0',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      maxCount: {
        '@value': '1',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      scope: 'https://data.vlaanderen.be/id/concept/scope/External',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:089cc30be132b4a8e55dd91f7559336ccb6b15b6da1cdf5da8764105c9c9d989',
      '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
      assignedURI: 'http://purl.org/dc/terms/title',
      apLabel: [
        {
          '@language': 'nl',
          '@value': 'naam',
        },
      ],
      diagramLabel: [
        {
          '@value': 'naam',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value': 'De naam van de Publieke Dienstverlening.',
        },
      ],
      domain: {
        '@id':
          'urn:oslo-toolchain:132869bbcca79d7380ce27f3d36f3b33249be46d6db0ab4b60c6d0f2fb913023',
      },
      range: {
        '@id': 'urn:oslo-toolchain:1727880001',
      },
      minCount: {
        '@value': '1',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      maxCount: {
        '@value': '1',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      scope: 'https://data.vlaanderen.be/id/concept/scope/External',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:c23ab9f5a1758064c9e837a37a9d084b776150d9939bf23682d26df94df7d005',
      '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
      assignedURI: 'http://xmlns.com/foaf/0.1/familyName',
      apLabel: [
        {
          '@language': 'nl',
          '@value': 'achternaam',
        },
      ],
      diagramLabel: [
        {
          '@value': 'achternaam',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value':
            'Gedeelte van de volledige naam van de Persoon ontvangen van de vorige generatie.',
        },
      ],
      apUsageNote: [
        {
          '@language': 'nl',
          '@value':
            'Ook wel familienaam genoemd omdat de achternaam een familiale verwantschap aanduidt.',
        },
      ],
      domain: {
        '@id':
          'urn:oslo-toolchain:66bcc61cd2cd05f365bc924932cccb2d9a0eba7d7680ce7b928ecb1b5f1c69c5',
      },
      range: {
        '@id': 'urn:oslo-toolchain:487667944',
      },
      minCount: {
        '@value': '0',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      maxCount: {
        '@value': '1',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      scope: 'https://data.vlaanderen.be/id/concept/scope/External',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:025a4a1edb47aaf6524bc0ce322ceb47be7b0c7b3830c1dccc97e1c4d2091fe5',
      '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
      assignedURI: 'http://purl.org/vocab/bio/0.1/date',
      apLabel: [
        {
          '@language': 'nl',
          '@value': 'datum',
        },
      ],
      diagramLabel: [
        {
          '@value': 'datum',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value': 'Datum waarop de gebeurtenis plaatsvond.',
        },
      ],
      domain: {
        '@id':
          'urn:oslo-toolchain:36e49157a1e6cdf420adf00f611b59963b23ef7c0d510806928958a901ec7862',
      },
      range: {
        '@id': 'urn:oslo-toolchain:499715870',
      },
      minCount: {
        '@value': '1',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      maxCount: {
        '@value': '1',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      scope: 'https://data.vlaanderen.be/id/concept/scope/External',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:c434c24e26bcdecf21673a2ac11e90b14416f72d9b8b28becb63d7384cf3d623',
      '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
      assignedURI: 'https://schema.org/endDate',
      apLabel: [
        {
          '@language': 'nl',
          '@value': 'einddatum',
        },
      ],
      diagramLabel: [
        {
          '@value': 'einddatum',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value': 'De datum waarop het Traject eindigt.',
        },
      ],
      domain: {
        '@id':
          'urn:oslo-toolchain:f87a934b403eae4bb15f4f55885d7d53b68103adcd814c47c0b75b45eb3b04ba',
      },
      range: {
        '@id': 'urn:oslo-toolchain:499715870',
      },
      minCount: {
        '@value': '0',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      maxCount: {
        '@value': '1',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      scope: 'https://data.vlaanderen.be/id/concept/scope/External',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:92ace326d69cbcfec0da5e876f883ef1d7df885c982c97f0ade2158175e31e19',
      '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
      assignedURI: 'http://purl.org/dc/terms/title',
      apLabel: [
        {
          '@language': 'nl',
          '@value': 'naam',
        },
      ],
      diagramLabel: [
        {
          '@value': 'naam',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value': 'De naam van een Traject.',
        },
      ],
      domain: {
        '@id':
          'urn:oslo-toolchain:f87a934b403eae4bb15f4f55885d7d53b68103adcd814c47c0b75b45eb3b04ba',
      },
      range: {
        '@id': 'urn:oslo-toolchain:1727880001',
      },
      minCount: {
        '@value': '1',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      maxCount: {
        '@value': '1',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      scope: 'https://data.vlaanderen.be/id/concept/scope/External',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:8f3fe4b81761ed089c3b9bb743637ff6f4f975e46704d656a8bc9758c970924f',
      '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
      assignedURI: 'https://schema.org/startDate',
      apLabel: [
        {
          '@language': 'nl',
          '@value': 'startdatum',
        },
      ],
      diagramLabel: [
        {
          '@value': 'startdatum',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value': 'De datum waarop het Traject start.',
        },
      ],
      domain: {
        '@id':
          'urn:oslo-toolchain:f87a934b403eae4bb15f4f55885d7d53b68103adcd814c47c0b75b45eb3b04ba',
      },
      range: {
        '@id': 'urn:oslo-toolchain:499715870',
      },
      minCount: {
        '@value': '0',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      maxCount: {
        '@value': '1',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      scope: 'https://data.vlaanderen.be/id/concept/scope/External',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:c0899c16f9a7ac3a8d8a2f4c2211649811b79b1cbc7d303401ce93c42824de53',
      '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
      assignedURI: 'http://xmlns.com/foaf/0.1/familyName',
      apLabel: [
        {
          '@language': 'nl',
          '@value': 'achternaam',
        },
      ],
      diagramLabel: [
        {
          '@value': 'achternaam',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value':
            'Gedeelte van de volledige naam van de Persoon ontvangen van de vorige generatie.',
        },
      ],
      apUsageNote: [
        {
          '@language': 'nl',
          '@value':
            'Ook wel familienaam genoemd omdat de achternaam een familiale verwantschap aanduidt.',
        },
      ],
      domain: {
        '@id':
          'urn:oslo-toolchain:89d54c9cf862cd83e7631a79373d0a3a4edd877682e7714ca1bea09ebf951057',
      },
      range: {
        '@id': 'urn:oslo-toolchain:487667944',
      },
      minCount: {
        '@value': '0',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      maxCount: {
        '@value': '1',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      scope: 'https://data.vlaanderen.be/id/concept/scope/External',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:7d628411411207951512e8ba9dda6dc7c7b7c1c543b518c90e8a1b3ca1ef2a73',
      '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
      assignedURI: 'http://xmlns.com/foaf/0.1/givenName',
      apLabel: [
        {
          '@language': 'nl',
          '@value': 'voornaam',
        },
      ],
      diagramLabel: [
        {
          '@value': 'voornaam',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value':
            'Naam die een Persoon bij geboorte wordt gegeven. Onderscheidt de Persoon van de andere personen in de familie.',
        },
      ],
      domain: {
        '@id':
          'urn:oslo-toolchain:89d54c9cf862cd83e7631a79373d0a3a4edd877682e7714ca1bea09ebf951057',
      },
      range: {
        '@id': 'urn:oslo-toolchain:487667944',
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
        'urn:oslo-toolchain:39839ac999c56c1a3fda1a626ce707a369b20a30b505168ab969c6942bc28d5a',
      '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
      assignedURI: 'https://schema.org/email',
      apLabel: [
        {
          '@language': 'nl',
          '@value': 'email',
        },
      ],
      diagramLabel: [
        {
          '@value': 'email',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value': 'Email-adres waarnaar men kan mailen.',
        },
      ],
      domain: {
        '@id':
          'urn:oslo-toolchain:dcb65e32de8b4af6464e922e0d68f150ea2e2e6a0fad8c5581e0c09ca57b1231',
      },
      range: {
        '@id': 'urn:oslo-toolchain:487667944',
      },
      minCount: {
        '@value': '0',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      maxCount: {
        '@value': '1',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      scope: 'https://data.vlaanderen.be/id/concept/scope/External',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:6d408d4950f06ff0ca896ea2aa9667e09711b4c8afe35eacc046160371bbb750',
      '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
      assignedURI: 'https://schema.org/telephone',
      apLabel: [
        {
          '@language': 'nl',
          '@value': 'telefoon',
        },
      ],
      diagramLabel: [
        {
          '@value': 'telefoon',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value': 'Telefoonnummer waarop men kan bellen.',
        },
      ],
      domain: {
        '@id':
          'urn:oslo-toolchain:dcb65e32de8b4af6464e922e0d68f150ea2e2e6a0fad8c5581e0c09ca57b1231',
      },
      range: {
        '@id': 'urn:oslo-toolchain:487667944',
      },
      minCount: {
        '@value': '0',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      maxCount: {
        '@value': '1',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      scope: 'https://data.vlaanderen.be/id/concept/scope/External',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:6e55bcbe3ede824bd798b87722086dbc6e61b439b012e2b3a7681dd27bc1e25d',
      '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
      assignedURI: 'http://www.w3.org/2004/02/skos/core#prefLabel',
      apLabel: [
        {
          '@language': 'nl',
          '@value': 'voorkeursnaam',
        },
      ],
      diagramLabel: [
        {
          '@value': 'voorkeursnaam',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value': 'Naam waarmee de Organisatie bij voorkeur wordt aangeduid.',
        },
      ],
      domain: {
        '@id':
          'urn:oslo-toolchain:00ce2e972f4fc32705be1f51218aee12b33184f3b015ac3b7b07dbe8b3aa93ef',
      },
      range: {
        '@id': 'urn:oslo-toolchain:1727880001',
      },
      minCount: {
        '@value': '1',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      maxCount: {
        '@value': '1',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      scope: 'https://data.vlaanderen.be/id/concept/scope/External',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:46aa06162974a9315224edbe488b93f38c65fdee0db53043620a596f24f59cab',
      '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
      assignedURI: 'http://www.w3.org/2000/01/rdf-schema#label',
      apLabel: [
        {
          '@language': 'nl',
          '@value': 'plaatsnaam',
        },
      ],
      diagramLabel: [
        {
          '@value': 'plaatsnaam',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value': 'Naam van de plaats of van het gebied.',
        },
      ],
      domain: {
        '@id':
          'urn:oslo-toolchain:61f069ee039fbc00d3aa41c20389c8de1411f5b89d470448a18e51c185fb96b0',
      },
      range: {
        '@id':
          'urn:oslo-toolchain:f86d46262b23965ba7b40ca729809619b3fe44b16cd3ead7bd0e5da2ae841f59',
      },
      minCount: {
        '@value': '1',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      maxCount: {
        '@value': '1',
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
    {
      '@id':
        'urn:oslo-toolchain:6ba9b1a766f56c3461448e8af4b84d5f77531a1ecde276a32e3fa9c1b493e861',
      '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
      assignedURI: 'https://data.vlaanderen.be/ns/adres#gemeentenaam',
      vocLabel: [
        {
          '@language': 'nl',
          '@value': 'gemeentenaam',
        },
      ],
      diagramLabel: [
        {
          '@value': 'gemeentenaam',
        },
      ],
      vocDefinition: [
        {
          '@language': 'nl',
          '@value': 'Gemeentenaam van het adres.',
        },
      ],
      domain: {
        '@id':
          'urn:oslo-toolchain:00ba2bbf60d2dfaa285b345c16ca10a4ed645a18f5663eb227288c5aa4e960fd',
      },
      range: {
        '@id': 'urn:oslo-toolchain:1727880001',
      },
      parent: {
        '@id': 'http://www.w3.org/ns/locn#postName',
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
    {
      '@id':
        'urn:oslo-toolchain:4094897d4494331378c9a909703e333365f82a89acba16a81119b51f75533c2d',
      '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
      assignedURI: 'https://data.vlaanderen.be/ns/adres#huisnummer',
      apLabel: [
        {
          '@language': 'nl',
          '@value': 'huisnummer',
        },
      ],
      diagramLabel: [
        {
          '@value': 'huisnummer',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value':
            'Alfanumerieke code officieel toegekend aan gebouweenheden, ligplaatsen, standplaatsen of percelen.',
        },
      ],
      apUsageNote: [
        {
          '@language': 'nl',
          '@value':
            'Specialisatie van Adresvoorstelling:locatieaanduiding tbv Belgische adressen.',
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
    {
      '@id':
        'urn:oslo-toolchain:30480f8ce7cbe3361990057166fd17caba5fd21d3c96340a3550100d17390fa6',
      '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
      assignedURI: 'https://data.vlaanderen.be/ns/adres#land',
      vocLabel: [
        {
          '@language': 'nl',
          '@value': 'land',
        },
      ],
      diagramLabel: [
        {
          '@value': 'land',
        },
      ],
      vocDefinition: [
        {
          '@language': 'nl',
          '@value': 'Land waarin het adres gelegen is.',
        },
      ],
      domain: {
        '@id':
          'urn:oslo-toolchain:00ba2bbf60d2dfaa285b345c16ca10a4ed645a18f5663eb227288c5aa4e960fd',
      },
      range: {
        '@id': 'urn:oslo-toolchain:1727880001',
      },
      parent: {
        '@id': 'http://www.w3.org/ns/locn#adminUnitL1',
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
    {
      '@id':
        'urn:oslo-toolchain:77d29fcac5ca168586be7263934ff8b0d8b19d5cca0bd3bbbf9794a324bdad0a',
      '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
      assignedURI: 'http://www.w3.org/ns/locn#postCode',
      apLabel: [
        {
          '@language': 'nl',
          '@value': 'postcode',
        },
      ],
      diagramLabel: [
        {
          '@value': 'postcode',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value':
            'Code waarmee het geografisch gebied dat adressen voor postale doeleinden groepeert wordt aangeduid.',
        },
      ],
      domain: {
        '@id':
          'urn:oslo-toolchain:00ba2bbf60d2dfaa285b345c16ca10a4ed645a18f5663eb227288c5aa4e960fd',
      },
      range: {
        '@id': 'urn:oslo-toolchain:487667944',
      },
      minCount: {
        '@value': '0',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      maxCount: {
        '@value': '1',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      scope: 'https://data.vlaanderen.be/id/concept/scope/External',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:14c7e48df255cbb89288874734fb370649951859f7341d150dad6c918181d870',
      '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
      assignedURI: 'http://www.w3.org/ns/locn#postName',
      apLabel: [
        {
          '@language': 'nl',
          '@value': 'postnaam',
        },
      ],
      diagramLabel: [
        {
          '@value': 'postnaam',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value':
            'Naam waarmee het geografisch gebied dat adressen voor postale doeleinden groepeert wordt aangeduid.',
        },
      ],
      domain: {
        '@id':
          'urn:oslo-toolchain:00ba2bbf60d2dfaa285b345c16ca10a4ed645a18f5663eb227288c5aa4e960fd',
      },
      range: {
        '@id': 'urn:oslo-toolchain:1727880001',
      },
      minCount: {
        '@value': '0',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      maxCount: {
        '@value': '1',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      scope: 'https://data.vlaanderen.be/id/concept/scope/External',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:63b6f3480a74b3d50c576b042a4b5e9499feb716c7fffe3691e170782c6cf62d',
      '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
      assignedURI: 'http://www.w3.org/ns/locn#thoroughfare',
      apLabel: [
        {
          '@language': 'nl',
          '@value': 'straatnaam',
        },
      ],
      diagramLabel: [
        {
          '@value': 'straatnaam',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value': 'Straatnaam van het adres.',
        },
      ],
      domain: {
        '@id':
          'urn:oslo-toolchain:00ba2bbf60d2dfaa285b345c16ca10a4ed645a18f5663eb227288c5aa4e960fd',
      },
      range: {
        '@id': 'urn:oslo-toolchain:1727880001',
      },
      minCount: {
        '@value': '0',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      maxCount: {
        '@value': '1',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      scope: 'https://data.vlaanderen.be/id/concept/scope/External',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:6647253ad19e273d26d8c7cce79513dff118e8feb8af565f57710bc867b6c8a8',
      '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
      assignedURI: 'http://www.w3.org/2004/02/skos/core#prefLabel',
      apLabel: [
        {
          '@language': 'nl',
          '@value': 'voorkeursnaam',
        },
      ],
      diagramLabel: [
        {
          '@value': 'voorkeursnaam',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value': 'Naam waarmee de Organisatie bij voorkeur wordt aangeduid.',
        },
      ],
      domain: {
        '@id':
          'urn:oslo-toolchain:c72f59f8d3fcebdebf32c8e5f5c0f40390e271b0becde64d562779120e39f3db',
      },
      range: {
        '@id': 'urn:oslo-toolchain:1727880001',
      },
      minCount: {
        '@value': '1',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      maxCount: {
        '@value': '1',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      scope: 'https://data.vlaanderen.be/id/concept/scope/External',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:f00835d707b9ed4080351d011db63aa6c2433169ca93ac52a9911ee691def779',
      '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
      assignedURI: 'http://xmlns.com/foaf/0.1/givenName',
      apLabel: [
        {
          '@language': 'nl',
          '@value': 'voornaam',
        },
      ],
      diagramLabel: [
        {
          '@value': 'voornaam',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value':
            'Naam die een Persoon bij geboorte wordt gegeven. Onderscheidt de Persoon van de andere personen in de familie.',
        },
      ],
      domain: {
        '@id':
          'urn:oslo-toolchain:66bcc61cd2cd05f365bc924932cccb2d9a0eba7d7680ce7b928ecb1b5f1c69c5',
      },
      range: {
        '@id': 'urn:oslo-toolchain:487667944',
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
        'urn:oslo-toolchain:d64e7233065091d39c2ee7a17b8bf33ed4c0e6713e8459ba3eeab5503e10108f',
      '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
      assignedURI: 'https://schema.org/startDate',
      apLabel: [
        {
          '@language': 'nl',
          '@value': 'startdatum',
        },
      ],
      diagramLabel: [
        {
          '@value': 'startdatum',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value': 'De datum waarop het Traject start.',
        },
      ],
      domain: {
        '@id':
          'urn:oslo-toolchain:f59bbf9085f552b332bb7960f6d7215dbf82fe1a3ec10f9d33a33653719b8690',
      },
      range: {
        '@id': 'urn:oslo-toolchain:499715870',
      },
      minCount: {
        '@value': '0',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      maxCount: {
        '@value': '1',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      scope: 'https://data.vlaanderen.be/id/concept/scope/External',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:b6acb59f61d7ba36f4381fb326128637e0e97c3b4a835568baa49f4e98578d61',
      '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
      assignedURI: 'https://schema.org/endDate',
      apLabel: [
        {
          '@language': 'nl',
          '@value': 'einddatum',
        },
      ],
      diagramLabel: [
        {
          '@value': 'einddatum',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value': 'De datum waarop het Traject eindigt.',
        },
      ],
      domain: {
        '@id':
          'urn:oslo-toolchain:f59bbf9085f552b332bb7960f6d7215dbf82fe1a3ec10f9d33a33653719b8690',
      },
      range: {
        '@id': 'urn:oslo-toolchain:499715870',
      },
      minCount: {
        '@value': '0',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      maxCount: {
        '@value': '1',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      scope: 'https://data.vlaanderen.be/id/concept/scope/External',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:13e965a7bf86781739143c41fdf685cffb24b9bd2b6266a4c757879d49ee4a95',
      '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
      assignedURI: 'http://purl.org/dc/terms/title',
      apLabel: [
        {
          '@language': 'nl',
          '@value': 'naam',
        },
      ],
      diagramLabel: [
        {
          '@value': 'naam',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value': 'Naam van het beroep.',
        },
      ],
      apUsageNote: [
        {
          '@language': 'nl',
          '@value': 'Bijvoorbeeld: Loodgieter, Dakwerker, etc.',
        },
      ],
      domain: {
        '@id':
          'urn:oslo-toolchain:42e6de198b0ace07bbdf38921213ef12d0f8d55ef4a21d1a97359b8542380d3e',
      },
      range: {
        '@id': 'urn:oslo-toolchain:1727880001',
      },
      minCount: {
        '@value': '0',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      maxCount: {
        '@value': '1',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      scope: 'https://data.vlaanderen.be/id/concept/scope/External',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:c6b5e9281edec06a46d2cacde0d86a501b4577afdb58f4df05a3ef9308852f50',
      '@type': 'http://www.w3.org/2002/07/owl#ObjectProperty',
      assignedURI: 'https://data.vlaanderen.be/ns/persoon#verblijfsadres',
      vocLabel: [
        {
          '@language': 'nl',
          '@value': 'verblijfsadres',
        },
      ],
      diagramLabel: [
        {
          '@value': 'verblijfsadres',
        },
      ],
      vocDefinition: [
        {
          '@language': 'nl',
          '@value': 'Adres van de Verblijfplaats.',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value':
            'Plaats waar een persoon al dan niet tijdelijk woont of logeert.',
        },
      ],
      domain: {
        '@id':
          'urn:oslo-toolchain:69541edab103f9ac8141e94644252c6e933e92f30861a7f4bb74659f9f1754f1',
      },
      range: {
        '@id':
          'urn:oslo-toolchain:00ba2bbf60d2dfaa285b345c16ca10a4ed645a18f5663eb227288c5aa4e960fd',
      },
      minCount: {
        '@value': '1',
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
    {
      '@id':
        'urn:oslo-toolchain:70e2e84d4a5e8fcc6d3492563e5e0032db784206cbd382870f01687786f34acc',
      '@type': 'http://www.w3.org/2002/07/owl#ObjectProperty',
      assignedURI: 'http://purl.org/dc/terms/creator',
      vocLabel: [
        {
          '@language': 'nl',
          '@value': 'maker',
        },
      ],
      apLabel: [
        {
          '@language': 'nl',
          '@value': 'toegekendDoor',
        },
      ],
      diagramLabel: [
        {
          '@value': 'toegekendDoor',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value': 'Link naar de agent die de identificator heeft uitgegeven.',
        },
      ],
      domain: {
        '@id':
          'urn:oslo-toolchain:06f6ee61443d1a73c88124b66f4c65776e7b1a9ec02c4e5abd2764932a842e08',
      },
      range: {
        '@id':
          'urn:oslo-toolchain:a514987ae892ef5ffeb2f76aff112dd32778d2b50d48bfff168efc8a497c981f',
      },
      minCount: {
        '@value': '0',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      maxCount: {
        '@value': '1',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      scope: 'https://data.vlaanderen.be/id/concept/scope/External',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:28b23b23e178621f34baeef7c5f1ebfac76f687a2ca1ed8b050d8f7f019bf0a0',
      '@type': 'http://www.w3.org/2002/07/owl#ObjectProperty',
      assignedURI: 'https://data.vlaanderen.be/ns/persoon#registratie',
      apLabel: [
        {
          '@language': 'nl',
          '@value': 'registratie',
        },
      ],
      diagramLabel: [
        {
          '@value': 'registratie',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value': 'Identificatiecode van de persoon in het register.',
        },
      ],
      domain: {
        '@id':
          'urn:oslo-toolchain:66bcc61cd2cd05f365bc924932cccb2d9a0eba7d7680ce7b928ecb1b5f1c69c5',
      },
      range: {
        '@id':
          'urn:oslo-toolchain:06f6ee61443d1a73c88124b66f4c65776e7b1a9ec02c4e5abd2764932a842e08',
      },
      parent: {
        '@id': 'http://www.w3.org/ns/adms#identifier',
      },
      minCount: {
        '@value': '1',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      maxCount: {
        '@value': '*',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      scope:
        'https://data.vlaanderen.be/id/concept/scope/InPublicationEnvironment',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:c95d92113d3588ae24feca77ec02f5e28fcd7428e4aa24614e201384f13d36c2',
      '@type': 'http://www.w3.org/2002/07/owl#ObjectProperty',
      assignedURI: 'http://purl.org/vocab/bio/0.1/place',
      apLabel: [
        {
          '@language': 'nl',
          '@value': 'plaats',
        },
      ],
      diagramLabel: [
        {
          '@value': 'plaats',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value': 'Plaats waar de gebeurtenis plaatsvond.',
        },
      ],
      apUsageNote: [
        {
          '@language': 'nl',
          '@value': 'Doorgaans een land of stad.',
        },
      ],
      domain: {
        '@id':
          'urn:oslo-toolchain:36e49157a1e6cdf420adf00f611b59963b23ef7c0d510806928958a901ec7862',
      },
      range: {
        '@id':
          'urn:oslo-toolchain:61f069ee039fbc00d3aa41c20389c8de1411f5b89d470448a18e51c185fb96b0',
      },
      minCount: {
        '@value': '1',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      maxCount: {
        '@value': '1',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      scope: 'https://data.vlaanderen.be/id/concept/scope/External',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:129985dae65f21cbe1ee6e17b08fbb522db29f2d80329974b53d67fc60a27af0',
      '@type': 'http://www.w3.org/2002/07/owl#ObjectProperty',
      assignedURI: 'https://schema.org/contactPoint',
      apLabel: [
        {
          '@language': 'nl',
          '@value': 'contactinfo',
        },
      ],
      diagramLabel: [
        {
          '@value': 'contactinfo',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value':
            'Informatie zoals email, telefoon... die toelaat de Organisatie te contacteren.',
        },
      ],
      domain: {
        '@id':
          'urn:oslo-toolchain:00ce2e972f4fc32705be1f51218aee12b33184f3b015ac3b7b07dbe8b3aa93ef',
      },
      range: {
        '@id':
          'urn:oslo-toolchain:dcb65e32de8b4af6464e922e0d68f150ea2e2e6a0fad8c5581e0c09ca57b1231',
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
        'urn:oslo-toolchain:db5923310aa7b38fe206c5f4851372dec5318dd1f4ae79957ccda1d178889c82',
      '@type': 'http://www.w3.org/2002/07/owl#ObjectProperty',
      assignedURI: 'http://data.europa.eu/m8g/hasCompetentAuthority',
      apLabel: [
        {
          '@language': 'nl',
          '@value': 'heeftVerantwoordelijke',
        },
      ],
      diagramLabel: [
        {
          '@value': 'heeftVerantwoordelijke',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value':
            'De Publieke Organisatie die verantwoordelijk is voor de Publieke Dienstverlening.',
        },
      ],
      domain: {
        '@id':
          'urn:oslo-toolchain:132869bbcca79d7380ce27f3d36f3b33249be46d6db0ab4b60c6d0f2fb913023',
      },
      range: {
        '@id':
          'urn:oslo-toolchain:c72f59f8d3fcebdebf32c8e5f5c0f40390e271b0becde64d562779120e39f3db',
      },
      minCount: {
        '@value': '1',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      maxCount: {
        '@value': '1',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      scope: 'https://data.vlaanderen.be/id/concept/scope/External',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:ed6284fe151bd0547c154267b34ba5ef3b5d1d87abe1d5da088087ec81accc74',
      '@type': 'http://www.w3.org/2002/07/owl#ObjectProperty',
      assignedURI: 'http://www.w3.org/ns/adms#status',
      apLabel: [
        {
          '@language': 'nl',
          '@value': 'status',
        },
      ],
      diagramLabel: [
        {
          '@value': 'status',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value': 'De status van het Traject.',
        },
      ],
      domain: {
        '@id':
          'urn:oslo-toolchain:f87a934b403eae4bb15f4f55885d7d53b68103adcd814c47c0b75b45eb3b04ba',
      },
      range: {
        '@id':
          'urn:oslo-toolchain:4db51d4f5cd45406fa19cae2259d2b2163164bdff8637e20a5685005a96d460e',
      },
      minCount: {
        '@value': '0',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      maxCount: {
        '@value': '1',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      scope: 'https://data.vlaanderen.be/id/concept/scope/External',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:eced0540692396569bd0d1c0c2878a24309e2995a13f79b3884ee8f0ecc638dd',
      '@type': 'http://www.w3.org/2002/07/owl#ObjectProperty',
      assignedURI: 'http://www.w3.org/ns/regorg#registration',
      apLabel: [
        {
          '@language': 'nl',
          '@value': 'registratie',
        },
      ],
      diagramLabel: [
        {
          '@value': 'registratie',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value':
            'Identificator dat de organisatie verkreeg bij registratie.',
        },
      ],
      apUsageNote: [
        {
          '@language': 'nl',
          '@value': 'In de KBO is dit het ondernemingsnummer.',
        },
      ],
      domain: {
        '@id':
          'urn:oslo-toolchain:00ce2e972f4fc32705be1f51218aee12b33184f3b015ac3b7b07dbe8b3aa93ef',
      },
      range: {
        '@id':
          'urn:oslo-toolchain:06f6ee61443d1a73c88124b66f4c65776e7b1a9ec02c4e5abd2764932a842e08',
      },
      minCount: {
        '@value': '1',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      maxCount: {
        '@value': '1',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      scope: 'https://data.vlaanderen.be/id/concept/scope/External',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:2e1521a8cab658033c32b14f19e934f366c1a0d1defc658bcc6e70be946bbe8c',
      '@type': 'http://www.w3.org/2002/07/owl#ObjectProperty',
      assignedURI: 'http://purl.org/vocab/bio/0.1/birth',
      apLabel: [
        {
          '@language': 'nl',
          '@value': 'heeftGeboorte',
        },
      ],
      diagramLabel: [
        {
          '@value': 'heeftGeboorte',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value': 'Verwijst naar de geboortegebeurtenis van de Persoon.',
        },
      ],
      apUsageNote: [
        {
          '@language': 'nl',
          '@value': 'Bevat vaak de geboortegevens van de Persoon.',
        },
      ],
      domain: {
        '@id':
          'urn:oslo-toolchain:89d54c9cf862cd83e7631a79373d0a3a4edd877682e7714ca1bea09ebf951057',
      },
      range: {
        '@id':
          'urn:oslo-toolchain:36e49157a1e6cdf420adf00f611b59963b23ef7c0d510806928958a901ec7862',
      },
      minCount: {
        '@value': '0',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      maxCount: {
        '@value': '1',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      scope: 'https://data.vlaanderen.be/id/concept/scope/External',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:a23a45cef6e9e21231d060c1911e9d69baf102f8ce18a4c58531e27034e198a2',
      '@type': 'http://www.w3.org/2002/07/owl#ObjectProperty',
      assignedURI: 'http://www.w3.org/ns/person#residency',
      apLabel: [
        {
          '@language': 'nl',
          '@value': 'inwonerschap',
        },
      ],
      diagramLabel: [
        {
          '@value': 'inwonerschap',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value':
            'Jurisdictie waarbinnen het Inwonerschap van de Persoon is gedefinieerd.',
        },
      ],
      domain: {
        '@id':
          'urn:oslo-toolchain:89d54c9cf862cd83e7631a79373d0a3a4edd877682e7714ca1bea09ebf951057',
      },
      range: {
        '@id':
          'urn:oslo-toolchain:a7492ef72875fc51ebef12fb9b32008c324947217769e7823c57548a2c44c3c3',
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
        'urn:oslo-toolchain:e6fb54b93fa7ff653d898936d5cff5687838605e3ad3b7fa2d574f2c50085e6a',
      '@type': 'http://www.w3.org/2002/07/owl#ObjectProperty',
      assignedURI: 'http://www.w3.org/ns/locn#address',
      apLabel: [
        {
          '@language': 'nl',
          '@value': 'adres',
        },
      ],
      diagramLabel: [
        {
          '@value': 'adres',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value': 'Adres dat men kan aanschrijven of bezoeken.',
        },
      ],
      domain: {
        '@id':
          'urn:oslo-toolchain:dcb65e32de8b4af6464e922e0d68f150ea2e2e6a0fad8c5581e0c09ca57b1231',
      },
      range: {
        '@id':
          'urn:oslo-toolchain:00ba2bbf60d2dfaa285b345c16ca10a4ed645a18f5663eb227288c5aa4e960fd',
      },
      minCount: {
        '@value': '0',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      maxCount: {
        '@value': '1',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      scope: 'https://data.vlaanderen.be/id/concept/scope/External',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:9ee17711976de4ffe537ec6dc718190cfb0328ce534d813f6fbe694c57aa0e8b',
      '@type': 'http://www.w3.org/2002/07/owl#ObjectProperty',
      assignedURI: 'https://schema.org/contactPoint',
      apLabel: [
        {
          '@language': 'nl',
          '@value': 'contactinfo',
        },
      ],
      diagramLabel: [
        {
          '@value': 'contactinfo',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value':
            'Informatie zoals email, telefoon... die toelaat de Persoon te contacteren.',
        },
      ],
      domain: {
        '@id':
          'urn:oslo-toolchain:66bcc61cd2cd05f365bc924932cccb2d9a0eba7d7680ce7b928ecb1b5f1c69c5',
      },
      range: {
        '@id':
          'urn:oslo-toolchain:dcb65e32de8b4af6464e922e0d68f150ea2e2e6a0fad8c5581e0c09ca57b1231',
      },
      minCount: {
        '@value': '1',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      maxCount: {
        '@value': '1',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      scope: 'https://data.vlaanderen.be/id/concept/scope/External',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:b5893368b45ef8bcc0d0b56150353a0b1be8cfbf2fad44a3e5988cf971a4489d',
      '@type': 'http://www.w3.org/2002/07/owl#ObjectProperty',
      assignedURI: 'https://schema.org/contactPoint',
      apLabel: [
        {
          '@language': 'nl',
          '@value': 'contactinfo',
        },
      ],
      diagramLabel: [
        {
          '@value': 'contactinfo',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value':
            'Informatie zoals email, telefoon... die toelaat de Persoon te contacteren.',
        },
      ],
      domain: {
        '@id':
          'urn:oslo-toolchain:89d54c9cf862cd83e7631a79373d0a3a4edd877682e7714ca1bea09ebf951057',
      },
      range: {
        '@id':
          'urn:oslo-toolchain:dcb65e32de8b4af6464e922e0d68f150ea2e2e6a0fad8c5581e0c09ca57b1231',
      },
      minCount: {
        '@value': '1',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      maxCount: {
        '@value': '1',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      scope: 'https://data.vlaanderen.be/id/concept/scope/External',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:f1e6d90f25c48987efbaa9a2676f81951a28dc7987654201f08f7b220b5e0644',
      '@type': 'http://www.w3.org/2002/07/owl#ObjectProperty',
      assignedURI: 'http://purl.org/vocab/bio/0.1/birth',
      apLabel: [
        {
          '@language': 'nl',
          '@value': 'heeftGeboorte',
        },
      ],
      diagramLabel: [
        {
          '@value': 'heeftGeboorte',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value': 'Verwijst naar de geboortegebeurtenis van de Persoon.',
        },
      ],
      apUsageNote: [
        {
          '@language': 'nl',
          '@value': 'Bevat vaak de geboortegevens van de Persoon.',
        },
      ],
      domain: {
        '@id':
          'urn:oslo-toolchain:66bcc61cd2cd05f365bc924932cccb2d9a0eba7d7680ce7b928ecb1b5f1c69c5',
      },
      range: {
        '@id':
          'urn:oslo-toolchain:36e49157a1e6cdf420adf00f611b59963b23ef7c0d510806928958a901ec7862',
      },
      minCount: {
        '@value': '0',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      maxCount: {
        '@value': '1',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      scope: 'https://data.vlaanderen.be/id/concept/scope/External',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
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
        'urn:oslo-toolchain:781be1f113f01b9ace155948711dc9551d40ef08bddf783578549b290fcba0d5',
      '@type': 'http://www.w3.org/2002/07/owl#ObjectProperty',
      assignedURI: 'http://purl.org/dc/terms/type',
      apLabel: [
        {
          '@language': 'nl',
          '@value': 'type',
        },
      ],
      diagramLabel: [
        {
          '@value': 'type',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value': 'Het soort Organisatie.',
        },
      ],
      domain: {
        '@id':
          'urn:oslo-toolchain:00ce2e972f4fc32705be1f51218aee12b33184f3b015ac3b7b07dbe8b3aa93ef',
      },
      range: {
        '@id':
          'urn:oslo-toolchain:6eea722400788e63c8a9e735dd45cd3a3aba5fc3eabc7f75e68e9c4f400517d9',
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
        'urn:oslo-toolchain:b8277eea9cb2ac8f6c87bef70a04dc86f7fe92677da571e4c4853be62c7e13b7',
      '@type': 'http://www.w3.org/2002/07/owl#ObjectProperty',
      assignedURI: 'https://data.vlaanderen.be/ns/klantvolgsysteem1/finaliteit',
      vocLabel: [
        {
          '@language': 'nl',
          '@value': 'finaliteit',
        },
      ],
      diagramLabel: [
        {
          '@value': 'finaliteit',
        },
      ],
      vocDefinition: [
        {
          '@language': 'nl',
          '@value': 'Wettelijk kader waarvoor de informatie wordt bevraagd.',
        },
      ],
      domain: {
        '@id':
          'urn:oslo-toolchain:132869bbcca79d7380ce27f3d36f3b33249be46d6db0ab4b60c6d0f2fb913023',
      },
      range: {
        '@id':
          'urn:oslo-toolchain:b523137ecece376293a77e902cf280b7f20d87c633447a75afcd6048bc418234',
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
    {
      '@id':
        'urn:oslo-toolchain:b576b404069bf63a0a8a3f99626b9326ec6ff2373c22419949f8a1e45a4d33ec',
      '@type': 'http://www.w3.org/2002/07/owl#ObjectProperty',
      assignedURI: 'http://www.w3.org/ns/person#residency',
      apLabel: [
        {
          '@language': 'nl',
          '@value': 'inwonerschap',
        },
      ],
      diagramLabel: [
        {
          '@value': 'inwonerschap',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value':
            'Jurisdictie waarbinnen het Inwonerschap van de Persoon is gedefinieerd.',
        },
      ],
      domain: {
        '@id':
          'urn:oslo-toolchain:66bcc61cd2cd05f365bc924932cccb2d9a0eba7d7680ce7b928ecb1b5f1c69c5',
      },
      range: {
        '@id':
          'urn:oslo-toolchain:a7492ef72875fc51ebef12fb9b32008c324947217769e7823c57548a2c44c3c3',
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
        'urn:oslo-toolchain:0e652f70ed444ca937e35a83a0252c4607cbf7600ae09c212bbf1ce5d829f17f',
      '@type': 'http://www.w3.org/2002/07/owl#ObjectProperty',
      assignedURI: 'http://www.w3.org/ns/adms#status',
      apLabel: [
        {
          '@language': 'nl',
          '@value': 'status',
        },
      ],
      diagramLabel: [
        {
          '@value': 'status',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value': 'De status van het Traject.',
        },
      ],
      domain: {
        '@id':
          'urn:oslo-toolchain:f59bbf9085f552b332bb7960f6d7215dbf82fe1a3ec10f9d33a33653719b8690',
      },
      range: {
        '@id':
          'urn:oslo-toolchain:4db51d4f5cd45406fa19cae2259d2b2163164bdff8637e20a5685005a96d460e',
      },
      minCount: {
        '@value': '0',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      maxCount: {
        '@value': '1',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      scope: 'https://data.vlaanderen.be/id/concept/scope/External',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:9205dc2b608ed06a6e0492502b1cf43040c91d1b0d3b36e7da6f3bbe0b25a3ea',
      '@type': 'http://www.w3.org/2002/07/owl#ObjectProperty',
      assignedURI: 'https://schema.org/contactPoint',
      apLabel: [
        {
          '@language': 'nl',
          '@value': 'contactinfo',
        },
      ],
      diagramLabel: [
        {
          '@value': 'contactinfo',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value':
            'Informatie zoals email, telefoon... die toelaat de Organisatie te contacteren.',
        },
      ],
      domain: {
        '@id':
          'urn:oslo-toolchain:c72f59f8d3fcebdebf32c8e5f5c0f40390e271b0becde64d562779120e39f3db',
      },
      range: {
        '@id':
          'urn:oslo-toolchain:dcb65e32de8b4af6464e922e0d68f150ea2e2e6a0fad8c5581e0c09ca57b1231',
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
        'urn:oslo-toolchain:de6c76b3b97b3ee5f40f91b3bebc7144f95773a5435c6ca2d549677b2a8213a4',
      '@type': 'http://www.w3.org/2002/07/owl#ObjectProperty',
      assignedURI: 'http://purl.org/dc/terms/type',
      apLabel: [
        {
          '@language': 'nl',
          '@value': 'type',
        },
      ],
      diagramLabel: [
        {
          '@value': 'type',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value': 'Het soort Organisatie.',
        },
      ],
      domain: {
        '@id':
          'urn:oslo-toolchain:c72f59f8d3fcebdebf32c8e5f5c0f40390e271b0becde64d562779120e39f3db',
      },
      range: {
        '@id':
          'urn:oslo-toolchain:6eea722400788e63c8a9e735dd45cd3a3aba5fc3eabc7f75e68e9c4f400517d9',
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
        'urn:oslo-toolchain:7f341ce736a93f7e7604366f411b73d7ebfd46a42470dcf58d15b2e28dd84d63',
      '@type': 'http://www.w3.org/2002/07/owl#ObjectProperty',
      assignedURI: 'http://purl.org/dc/terms/type',
      apLabel: [
        {
          '@language': 'nl',
          '@value': 'type',
        },
      ],
      diagramLabel: [
        {
          '@value': 'type',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value': 'Het soort Publieke Dienstverlening.',
        },
      ],
      apUsageNote: [
        {
          '@language': 'nl',
          '@value': 'Bijvoorbeeld: Orientatie, Begeleiding, etc.',
        },
      ],
      domain: {
        '@id':
          'urn:oslo-toolchain:132869bbcca79d7380ce27f3d36f3b33249be46d6db0ab4b60c6d0f2fb913023',
      },
      range: {
        '@id':
          'urn:oslo-toolchain:dccc82bfd432bb7d73011f80a546e00a86bf81c42db8b5258b0b99b617d9497e',
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
        'urn:oslo-toolchain:7cb4b7b8dde0db13454458d09973f35bb19bbb77ccffe0e3bbd93d6a6977bf10',
      '@type': 'http://www.w3.org/2002/07/owl#ObjectProperty',
      assignedURI: 'https://data.vlaanderen.be/ns/klantvolgsysteem1/beroep',
      vocLabel: [
        {
          '@language': 'nl',
          '@value': 'beroep',
        },
      ],
      diagramLabel: [
        {
          '@value': 'beroep',
        },
      ],
      vocDefinition: [
        {
          '@language': 'nl',
          '@value': 'Voorkeuren voor bepaalde beroepen.',
        },
      ],
      domain: {
        '@id':
          'urn:oslo-toolchain:8a9d72ed86bf3c9730f5303b7b0306060d960614d9b5a929fb693b29627cd278',
      },
      range: {
        '@id':
          'urn:oslo-toolchain:42e6de198b0ace07bbdf38921213ef12d0f8d55ef4a21d1a97359b8542380d3e',
      },
      minCount: {
        '@value': '0',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      maxCount: {
        '@value': '*',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      scope:
        'https://data.vlaanderen.be/id/concept/scope/InPublicationEnvironment',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:af71e86c53309929c3f2f7d6c3c18f6c5de47983f373740381b0209d72b09526',
      '@type': 'http://www.w3.org/2002/07/owl#ObjectProperty',
      assignedURI: 'http://purl.org/dc/terms/type',
      apLabel: [
        {
          '@language': 'nl',
          '@value': 'type',
        },
      ],
      diagramLabel: [
        {
          '@value': 'type',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value': 'Het soort Traject.',
        },
      ],
      apUsageNote: [
        {
          '@language': 'nl',
          '@value': 'Bijvoorbeeld: Opleiding, Interview, etc.',
        },
      ],
      domain: {
        '@id':
          'urn:oslo-toolchain:f87a934b403eae4bb15f4f55885d7d53b68103adcd814c47c0b75b45eb3b04ba',
      },
      range: {
        '@id':
          'urn:oslo-toolchain:93f328af990ada84707cd3cb5d2f36d2920c466070d0035919e48c3a05f46ed1',
      },
      minCount: {
        '@value': '0',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      maxCount: {
        '@value': '1',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      scope: 'https://data.vlaanderen.be/id/concept/scope/External',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:539f752b03c68c6dacce9b8624fd650f3b9f30c466eb972d76089fb04bd3b7c8',
      '@type': 'http://www.w3.org/2002/07/owl#ObjectProperty',
      assignedURI: 'http://www.w3.org/ns/adms#identifier',
      apLabel: [
        {
          '@language': 'nl',
          '@value': 'identificator',
        },
      ],
      diagramLabel: [
        {
          '@value': 'identificator',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value': 'Identificator dat de organisatie uniek indentificeert.',
        },
      ],
      apUsageNote: [
        {
          '@language': 'nl',
          '@value': 'In de KBO is dit het ondernemingsnummer.',
        },
      ],
      domain: {
        '@id':
          'urn:oslo-toolchain:c72f59f8d3fcebdebf32c8e5f5c0f40390e271b0becde64d562779120e39f3db',
      },
      range: {
        '@id':
          'urn:oslo-toolchain:06f6ee61443d1a73c88124b66f4c65776e7b1a9ec02c4e5abd2764932a842e08',
      },
      minCount: {
        '@value': '1',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      maxCount: {
        '@value': '1',
        '@type': 'http://www.w3.org/2001/XMLSchema#string',
      },
      scope: 'https://data.vlaanderen.be/id/concept/scope/External',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:1fab59220bc8b951769ac276a3734f6b287cabd1cacc62d8c4d38fb28ba32c17',
      '@type': 'http://www.w3.org/2002/07/owl#ObjectProperty',
      assignedURI: 'https://data.vlaanderen.be/ns/klantvolgsysteem1/voorkeur',
      vocLabel: [
        {
          '@language': 'nl',
          '@value': 'voorkeur',
        },
      ],
      diagramLabel: [
        {
          '@value': 'voorkeur',
        },
      ],
      vocDefinition: [
        {
          '@language': 'nl',
          '@value': 'De soort voorkeur voor een bepaald beroep.',
        },
      ],
      vocUsageNote: [
        {
          '@language': 'nl',
          '@value': 'Bijvoorbeeld: te verkennen, uitgesloten, etc.',
        },
      ],
      domain: {
        '@id':
          'urn:oslo-toolchain:42e6de198b0ace07bbdf38921213ef12d0f8d55ef4a21d1a97359b8542380d3e',
      },
      range: {
        '@id':
          'urn:oslo-toolchain:292572e4e6129b3818b0232961d3932cc3cf6139821dc028e940644ce5393f34',
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
    {
      '@id':
        'urn:oslo-toolchain:2eba0a1c63c9d958616962539a8d3be87302462d55cd8dec8e23dec538009d50',
      '@type': 'http://www.w3.org/2002/07/owl#ObjectProperty',
      assignedURI: 'http://data.europa.eu/m8g/hasParticipant',
      apLabel: [
        {
          '@language': 'nl',
          '@value': 'heeftParticipant',
        },
      ],
      diagramLabel: [
        {
          '@value': 'heeftParticipant',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value': 'De Agenten die deelnemen.',
        },
      ],
      domain: {
        '@id':
          'urn:oslo-toolchain:77b8d897806e4b9812722f16da80e1aa5650621c0247afd0a6dcacd59d22594b',
      },
      range: {
        '@id':
          'urn:oslo-toolchain:b954552fd64a110b7edc2539cd01dee3687f9bb38e0fb0fd6c9ae68249b2406d',
      },
      minCount: {
        '@value': '0',
        '@type': 'http://www.w3.org/2001/XMLSchema#integer',
      },
      maxCount: {
        '@value': '*',
        '@type': 'http://www.w3.org/2001/XMLSchema#integer',
      },
      scope: 'https://data.vlaanderen.be/id/concept/scope/External',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:febe34bf04aafc4ecb67f410d3dcfb345bdd9d2063a04056ed2df93ccdc3f29a',
      '@type': 'http://www.w3.org/2002/07/owl#ObjectProperty',
      assignedURI: 'http://purl.org/dc/terms/hasPart',
      vocLabel: [
        {
          '@language': 'nl',
          '@value': 'deeltraject',
        },
      ],
      diagramLabel: [
        {
          '@value': 'deeltraject',
        },
      ],
      vocDefinition: [
        {
          '@language': 'nl',
          '@value': 'De Deeltrajecten gelinkt aan dit Traject.',
        },
      ],
      domain: {
        '@id':
          'urn:oslo-toolchain:f59bbf9085f552b332bb7960f6d7215dbf82fe1a3ec10f9d33a33653719b8690',
      },
      range: {
        '@id':
          'urn:oslo-toolchain:f87a934b403eae4bb15f4f55885d7d53b68103adcd814c47c0b75b45eb3b04ba',
      },
      minCount: {
        '@value': '0',
        '@type': 'http://www.w3.org/2001/XMLSchema#integer',
      },
      maxCount: {
        '@value': '*',
        '@type': 'http://www.w3.org/2001/XMLSchema#integer',
      },
      scope: 'https://data.vlaanderen.be/id/concept/scope/External',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:59740e890857dcfb7f174611afa43fc2773546ff847d19c7ab5c827b425ae784',
      '@type': 'http://www.w3.org/2002/07/owl#ObjectProperty',
      assignedURI: 'http://purl.org/vocab/cpsv#hasInput',
      apLabel: [
        {
          '@language': 'nl',
          '@value': 'gebruikt',
        },
      ],
      diagramLabel: [
        {
          '@value': 'gebruikt',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value':
            'Referenties naar alle Inputs die de Publieke Dienstverlening gebruikt om een of meerdere Outputs te produceren.',
        },
      ],
      domain: {
        '@id':
          'urn:oslo-toolchain:132869bbcca79d7380ce27f3d36f3b33249be46d6db0ab4b60c6d0f2fb913023',
      },
      range: {
        '@id':
          'urn:oslo-toolchain:8a9d72ed86bf3c9730f5303b7b0306060d960614d9b5a929fb693b29627cd278',
      },
      minCount: {
        '@value': '0',
        '@type': 'http://www.w3.org/2001/XMLSchema#integer',
      },
      maxCount: {
        '@value': '*',
        '@type': 'http://www.w3.org/2001/XMLSchema#integer',
      },
      scope: 'https://data.vlaanderen.be/id/concept/scope/External',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:3da9c578770f86fce5c3050128d810086b25d5919a56399f3b2e14a27d829a7f',
      '@type': 'http://www.w3.org/2002/07/owl#ObjectProperty',
      assignedURI: 'http://data.europa.eu/m8g/hasParticipation',
      apLabel: [
        {
          '@language': 'nl',
          '@value': 'heeftParticipatie',
        },
      ],
      diagramLabel: [
        {
          '@value': 'heeftParticipatie',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value': 'De Agenten die deelnemen aan de Publieke Dienstverlening.',
        },
      ],
      domain: {
        '@id':
          'urn:oslo-toolchain:132869bbcca79d7380ce27f3d36f3b33249be46d6db0ab4b60c6d0f2fb913023',
      },
      range: {
        '@id':
          'urn:oslo-toolchain:77b8d897806e4b9812722f16da80e1aa5650621c0247afd0a6dcacd59d22594b',
      },
      minCount: {
        '@value': '0',
        '@type': 'http://www.w3.org/2001/XMLSchema#integer',
      },
      maxCount: {
        '@value': '*',
        '@type': 'http://www.w3.org/2001/XMLSchema#integer',
      },
      scope: 'https://data.vlaanderen.be/id/concept/scope/External',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:7a8fa4d041335a83f1170e318861f147135c1121745217fc1d7d48c36bff5645',
      '@type': 'http://www.w3.org/2002/07/owl#ObjectProperty',
      assignedURI: 'http://data.europa.eu/m8g/hasParticipation',
      apLabel: [
        {
          '@language': 'nl',
          '@value': 'heeftParticipatie',
        },
      ],
      diagramLabel: [
        {
          '@value': 'heeftParticipatie',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value': 'De Agenten die deelnemen aan het Deeltraject.',
        },
      ],
      domain: {
        '@id':
          'urn:oslo-toolchain:f87a934b403eae4bb15f4f55885d7d53b68103adcd814c47c0b75b45eb3b04ba',
      },
      range: {
        '@id':
          'urn:oslo-toolchain:77b8d897806e4b9812722f16da80e1aa5650621c0247afd0a6dcacd59d22594b',
      },
      minCount: {
        '@value': '0',
        '@type': 'http://www.w3.org/2001/XMLSchema#integer',
      },
      maxCount: {
        '@value': '*',
        '@type': 'http://www.w3.org/2001/XMLSchema#integer',
      },
      scope: 'https://data.vlaanderen.be/id/concept/scope/External',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:bb5273001a0b11a6e1adc828fe993fa1769099d3510bd69ef75c0316019e3b27',
      '@type': 'http://www.w3.org/2002/07/owl#ObjectProperty',
      assignedURI:
        'https://data.vlaanderen.be/ns/klantvolgsysteem1/werkvoorkeuren',
      vocLabel: [
        {
          '@language': 'nl',
          '@value': 'werkvoorkeuren',
        },
      ],
      diagramLabel: [
        {
          '@value': 'werkvoorkeuren',
        },
      ],
      vocDefinition: [
        {
          '@language': 'nl',
          '@value': 'De voorkeuren voor werk van een Persoon.',
        },
      ],
      domain: {
        '@id':
          'urn:oslo-toolchain:66bcc61cd2cd05f365bc924932cccb2d9a0eba7d7680ce7b928ecb1b5f1c69c5',
      },
      range: {
        '@id':
          'urn:oslo-toolchain:8a9d72ed86bf3c9730f5303b7b0306060d960614d9b5a929fb693b29627cd278',
      },
      minCount: {
        '@value': '0',
        '@type': 'http://www.w3.org/2001/XMLSchema#integer',
      },
      maxCount: {
        '@value': '*',
        '@type': 'http://www.w3.org/2001/XMLSchema#integer',
      },
      scope:
        'https://data.vlaanderen.be/id/concept/scope/InPublicationEnvironment',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:f909649444ebd582069745a3fb0914826d7d508ce4560a45f52948dfb6d04b16',
      '@type': 'http://www.w3.org/2002/07/owl#ObjectProperty',
      assignedURI: 'http://data.europa.eu/m8g/hasParticipation',
      apLabel: [
        {
          '@language': 'nl',
          '@value': 'heeftParticipatie',
        },
      ],
      diagramLabel: [
        {
          '@value': 'heeftParticipatie',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value': 'De Agenten die deelnemen aan het Activeringstraject.',
        },
      ],
      domain: {
        '@id':
          'urn:oslo-toolchain:f59bbf9085f552b332bb7960f6d7215dbf82fe1a3ec10f9d33a33653719b8690',
      },
      range: {
        '@id':
          'urn:oslo-toolchain:77b8d897806e4b9812722f16da80e1aa5650621c0247afd0a6dcacd59d22594b',
      },
      minCount: {
        '@value': '0',
        '@type': 'http://www.w3.org/2001/XMLSchema#integer',
      },
      maxCount: {
        '@value': '*',
        '@type': 'http://www.w3.org/2001/XMLSchema#integer',
      },
      scope: 'https://data.vlaanderen.be/id/concept/scope/External',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:f5fd5116afae236d1d0ddef3cdfb120e0dba07e71f14e4e4d3a2b2658047e297',
      '@type': 'http://www.w3.org/2002/07/owl#ObjectProperty',
      assignedURI: 'https://data.vlaanderen.be/ns/persoon#heeftVerblijfplaats',
      vocLabel: [
        {
          '@language': 'nl',
          '@value': 'heeftVerblijfplaats',
        },
      ],
      diagramLabel: [
        {
          '@value': 'heeftVerblijfplaats',
        },
      ],
      vocDefinition: [
        {
          '@language': 'nl',
          '@value': 'Plaats waar een persoon verblijft.',
        },
      ],
      domain: {
        '@id':
          'urn:oslo-toolchain:92607a4802f2d1e74b18cdfa61849c2fa3f310a0a59c69a4ef8ba9e64b51e1db',
      },
      range: {
        '@id':
          'urn:oslo-toolchain:69541edab103f9ac8141e94644252c6e933e92f30861a7f4bb74659f9f1754f1',
      },
      minCount: {
        '@value': '0',
        '@type': 'http://www.w3.org/2001/XMLSchema#integer',
      },
      maxCount: {
        '@value': '*',
        '@type': 'http://www.w3.org/2001/XMLSchema#integer',
      },
      scope:
        'https://data.vlaanderen.be/id/concept/scope/InPublicationEnvironment',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:f2e0d90858887cccf196affd5ffd86e2d6583e0895c23cabba594628a88609fd',
      '@type': 'http://www.w3.org/2002/07/owl#ObjectProperty',
      assignedURI: 'http://purl.org/vocab/cpsv#produces',
      apLabel: [
        {
          '@language': 'nl',
          '@value': 'produceert',
        },
      ],
      diagramLabel: [
        {
          '@value': 'produceert',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value':
            'De referenties naar alle resources die de Publieke Dienstverlening produceert.',
        },
      ],
      domain: {
        '@id':
          'urn:oslo-toolchain:132869bbcca79d7380ce27f3d36f3b33249be46d6db0ab4b60c6d0f2fb913023',
      },
      range: {
        '@id':
          'urn:oslo-toolchain:f59bbf9085f552b332bb7960f6d7215dbf82fe1a3ec10f9d33a33653719b8690',
      },
      minCount: {
        '@value': '0',
        '@type': 'http://www.w3.org/2001/XMLSchema#integer',
      },
      maxCount: {
        '@value': '*',
        '@type': 'http://www.w3.org/2001/XMLSchema#integer',
      },
      scope: 'https://data.vlaanderen.be/id/concept/scope/External',
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
    {
      '@id':
        'urn:oslo-toolchain:dcb65e32de8b4af6464e922e0d68f150ea2e2e6a0fad8c5581e0c09ca57b1231',
      '@type': 'Datatype',
      assignedURI: 'https://schema.org/ContactPoint',
      apLabel: [
        {
          '@language': 'nl',
          '@value': 'Contactpunt',
        },
      ],
      diagramLabel: [
        {
          '@value': 'Contactinfo',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value':
            'Informatie zoals email, telefoon, adres die toelaat om iemand of iets te contacteren.',
        },
      ],
      apUsageNote: [
        {
          '@language': 'nl',
          '@value':
            'Bijvoorbeeld: een persoon of organisatie of dienstverlening... Mogelijke vormen van contact: bellen, mailen, etc.',
        },
      ],
      scope: 'https://data.vlaanderen.be/id/concept/scope/External',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:06f6ee61443d1a73c88124b66f4c65776e7b1a9ec02c4e5abd2764932a842e08',
      '@type': 'Datatype',
      assignedURI: 'http://www.w3.org/ns/adms#Identifier',
      apLabel: [
        {
          '@language': 'nl',
          '@value': 'Identificator',
        },
      ],
      diagramLabel: [
        {
          '@value': 'Identificator',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value': 'Informatie gebruikt om een object uniek te identificeren.',
        },
      ],
      apUsageNote: [
        {
          '@language': 'nl',
          '@value':
            'Uitgangspunt hier is dat deze string door een organisatie wordt toegekend en dat dit gebeurt volgens een welbepaald systeem.',
        },
      ],
      scope: 'https://data.vlaanderen.be/id/concept/scope/External',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:42e6de198b0ace07bbdf38921213ef12d0f8d55ef4a21d1a97359b8542380d3e',
      '@type': 'Datatype',
      assignedURI:
        'https://data.vlaanderen.be/ns/klantvolgsysteem1/Beroepstoestand',
      vocLabel: [
        {
          '@language': 'nl',
          '@value': 'Beroepstoestand',
        },
      ],
      diagramLabel: [
        {
          '@value': 'Beroepstoestand',
        },
      ],
      vocDefinition: [
        {
          '@language': 'nl',
          '@value': 'Voorkeur voor een bepaald beroep.',
        },
      ],
      apUsageNote: [
        {
          '@language': 'nl',
          '@value': 'Bijvoorbeeld: voorkeur of afkeur voor een bepaald beroep.',
        },
      ],
      scope:
        'https://data.vlaanderen.be/id/concept/scope/InPublicationEnvironment',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:f86d46262b23965ba7b40ca729809619b3fe44b16cd3ead7bd0e5da2ae841f59',
      '@type': 'Datatype',
      assignedURI: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString',
      apLabel: [
        {
          '@language': 'nl',
          '@value': 'GeografischeNaam',
        },
      ],
      diagramLabel: [
        {
          '@value': 'GeografischeNaam',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value':
            'Benaming toegekend aan of gebruikt voor een geografisch object.',
        },
      ],
      scope: 'https://data.vlaanderen.be/id/concept/scope/External',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id': 'urn:oslo-toolchain:2049156247',
      '@type': 'Datatype',
      assignedURI: 'http://www.w3.org/2000/01/rdf-schema#Literal',
      diagramLabel: [
        {
          '@value': 'Literal',
        },
      ],
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id': 'urn:oslo-toolchain:1727880001',
      '@type': 'Datatype',
      assignedURI: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString',
      diagramLabel: [
        {
          '@value': 'LangString',
        },
      ],
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id': 'urn:oslo-toolchain:487667944',
      '@type': 'Datatype',
      assignedURI: 'http://www.w3.org/2001/XMLSchema#string',
      diagramLabel: [
        {
          '@value': 'String',
        },
      ],
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id': 'urn:oslo-toolchain:499715870',
      '@type': 'Datatype',
      assignedURI: 'http://www.w3.org/2001/XMLSchema#dateTime',
      diagramLabel: [
        {
          '@value': 'DateTime',
        },
      ],
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
  ],
  referencedEntities: [
    {
      '@id':
        'urn:oslo-toolchain:8a9d72ed86bf3c9730f5303b7b0306060d960614d9b5a929fb693b29627cd278',
      '@type': 'http://www.w3.org/2002/07/owl#Class',
    },
    {
      '@id':
        'urn:oslo-toolchain:ca8204c2e2bad8aed9e83ab223edd70b07450b5a22caf3ce4fbcaf885a5ea881',
      assignedURI: 'http://data.europa.eu/m8g/Input',
      apLabel: [
        {
          '@language': 'nl',
          '@value': 'Input',
        },
      ],
      diagramLabel: [
        {
          '@value': 'Input',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value':
            'Een Input kan elke resource zijn zoals een document, artefact, etc. dat gebruikt is door de Publieke Dienstverlening om een Output te produceren.',
        },
      ],
      scope: 'https://data.vlaanderen.be/id/concept/scope/External',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:f59bbf9085f552b332bb7960f6d7215dbf82fe1a3ec10f9d33a33653719b8690',
      '@type': 'http://www.w3.org/2002/07/owl#Class',
    },
    {
      '@id':
        'urn:oslo-toolchain:79a176236964bafa9776d3abe8e8a2548de5051589fa42e9ea6f38a5e1886dc8',
      assignedURI: 'https://data.vlaanderen.be/ns/klantvolgsysteem1/Traject',
      apLabel: [
        {
          '@language': 'nl',
          '@value': 'Traject',
        },
      ],
      diagramLabel: [
        {
          '@value': 'Traject',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value':
            'Het Traject dat een Werkzoekende moet doorlopen om aan werk te geraken.',
        },
      ],
      scope:
        'https://data.vlaanderen.be/id/concept/scope/InPublicationEnvironment',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:f87a934b403eae4bb15f4f55885d7d53b68103adcd814c47c0b75b45eb3b04ba',
      '@type': 'http://www.w3.org/2002/07/owl#Class',
    },
    {
      '@id':
        'urn:oslo-toolchain:a514987ae892ef5ffeb2f76aff112dd32778d2b50d48bfff168efc8a497c981f',
      assignedURI: 'http://purl.org/dc/terms/Agent',
      apLabel: [
        {
          '@language': 'nl',
          '@value': 'Agent',
        },
      ],
      diagramLabel: [
        {
          '@value': 'Agent',
        },
      ],
      apDefinition: [
        {
          '@language': 'nl',
          '@value':
            'Iemand die of iets dat kan handelen of een effect kan teweeg brengen.',
        },
      ],
      apUsageNote: [
        {
          '@language': 'nl',
          '@value': 'Te vervangen door een niet-abstracte klasse.',
        },
      ],
      scope: 'https://data.vlaanderen.be/id/concept/scope/External',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:4db51d4f5cd45406fa19cae2259d2b2163164bdff8637e20a5685005a96d460e',
      assignedURI: 'http://www.w3.org/2004/02/skos/core#Concept',
      diagramLabel: [
        {
          '@value': 'Trajectstatustype',
        },
      ],
      scope: 'https://data.vlaanderen.be/id/concept/scope/External',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:a7492ef72875fc51ebef12fb9b32008c324947217769e7823c57548a2c44c3c3',
      assignedURI: 'https://data.vlaanderen.be/ns/persoon#Inwonerschap',
      vocLabel: [
        {
          '@language': 'nl',
          '@value': 'Inwonerschap',
        },
      ],
      diagramLabel: [
        {
          '@value': 'Inwonerschap',
        },
      ],
      vocDefinition: [
        {
          '@language': 'nl',
          '@value':
            'Het feit dat een Persoon verblijf houdt in een plaats of land.',
        },
      ],
      scope:
        'https://data.vlaanderen.be/id/concept/scope/InPublicationEnvironment',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:5be6177bce6b88114c9ed6e09320229ccdf93133001c1c8f9eb0cd04bdfebdca',
      assignedURI: 'http://www.w3.org/2004/02/skos/core#Concept',
      diagramLabel: [
        {
          '@value': 'Participatietype',
        },
      ],
      scope: 'https://data.vlaanderen.be/id/concept/scope/External',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:6eea722400788e63c8a9e735dd45cd3a3aba5fc3eabc7f75e68e9c4f400517d9',
      assignedURI: 'http://www.w3.org/2004/02/skos/core#Concept',
      diagramLabel: [
        {
          '@value': 'OrganisatieType',
        },
      ],
      scope: 'https://data.vlaanderen.be/id/concept/scope/External',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:b523137ecece376293a77e902cf280b7f20d87c633447a75afcd6048bc418234',
      assignedURI: 'http://www.w3.org/2004/02/skos/core#Concept',
      diagramLabel: [
        {
          '@value': 'FinaliteitType',
        },
      ],
      scope: 'https://data.vlaanderen.be/id/concept/scope/External',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:dccc82bfd432bb7d73011f80a546e00a86bf81c42db8b5258b0b99b617d9497e',
      assignedURI: 'http://www.w3.org/2004/02/skos/core#Concept',
      diagramLabel: [
        {
          '@value': 'PubliekeDienstverleningtype',
        },
      ],
      scope: 'https://data.vlaanderen.be/id/concept/scope/External',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:93f328af990ada84707cd3cb5d2f36d2920c466070d0035919e48c3a05f46ed1',
      assignedURI: 'http://www.w3.org/2004/02/skos/core#Concept',
      diagramLabel: [
        {
          '@value': 'Deeltrajecttype',
        },
      ],
      scope: 'https://data.vlaanderen.be/id/concept/scope/External',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
    {
      '@id':
        'urn:oslo-toolchain:292572e4e6129b3818b0232961d3932cc3cf6139821dc028e940644ce5393f34',
      assignedURI: 'http://www.w3.org/2004/02/skos/core#Concept',
      diagramLabel: [
        {
          '@value': 'Voorkeurtype',
        },
      ],
      scope: 'https://data.vlaanderen.be/id/concept/scope/External',
      status:
        'https://data.vlaanderen.be/id/concept/StandaardStatus/OntwerpStandaard',
    },
  ],
};

export const kvsOutput = {
  "openapi": "3.0.4",
  "info": {
    "title": "My API",
    "description": "My description of my API.",
    "version": "1.0.0"
  },
  "servers": [
    {
      "url": "http://example.com",
      "description": "Basis URL"
    }
  ],
  "paths": {
    "/id/Participatie/{id}": {
      "get": {
        "summary": "De rol waarin een Agent deelneemt aan de Publieke Dienstverlening.",
        "description": "De rol waarin een Agent deelneemt aan de Publieke Dienstverlening.",
        "operationId": "ParticipatieGET",
        "tags": [
          "Externe datastandaarden"
        ],
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "description": "Identificator van een Participatie object.",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Participatie object gevonden.",
            "content": {
              "application/ld+json": {
                "schema": {
                  "$ref": "#/components/schemas/Participatie"
                }
              }
            },
            "links": {
              "ParticipatietypeGET": {
                "operationId": "ParticipatietypeGET",
                "parameters": {
                  "id": "$response.body#/Participatie.rol/@id"
                },
                "description": "Het `@id` attribuut van de waarde van `Participatie.rol` kan gebruikt worden om het gerefereerde object van het type `Participatietype` op te halen."
              },
              "AgentGET": {
                "operationId": "AgentGET",
                "parameters": {
                  "id": "$response.body#/Participatie.heeftParticipant/@id"
                },
                "description": "Het `@id` attribuut van de waarde van `Participatie.heeftParticipant` kan gebruikt worden om het gerefereerde object van het type `Agent` op te halen."
              }
            }
          },
          "400": {
            "description": "Ontbrekende informatie bij het opvragen een Participatie object."
          },
          "404": {
            "description": "Participatie object met gegeven ID niet gevonden."
          }
        }
      }
    },
    "/id/Verblijfplaats/{id}": {
      "get": {
        "summary": "Plaats waar een Persoon al dan niet tijdelijk woont of logeert.",
        "description": "Plaats waar een Persoon al dan niet tijdelijk woont of logeert.",
        "operationId": "VerblijfplaatsGET",
        "tags": [
          "OSLO"
        ],
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "description": "Identificator van een Verblijfplaats object.",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Verblijfplaats object gevonden.",
            "content": {
              "application/ld+json": {
                "schema": {
                  "$ref": "#/components/schemas/Verblijfplaats"
                }
              }
            },
            "links": {
              "AdresvoorstellingGET": {
                "operationId": "AdresvoorstellingGET",
                "parameters": {
                  "id": "$response.body#/Verblijfplaats.verblijfsadres/@id"
                },
                "description": "Het `@id` attribuut van de waarde van `Verblijfplaats.verblijfsadres` kan gebruikt worden om het gerefereerde object van het type `Adresvoorstelling` op te halen."
              }
            }
          },
          "400": {
            "description": "Ontbrekende informatie bij het opvragen een Verblijfplaats object."
          },
          "404": {
            "description": "Verblijfplaats object met gegeven ID niet gevonden."
          }
        }
      }
    },
    "/id/Inwonerschap/{id}": {
      "get": {
        "summary": "Het feit dat een Persoon verblijf houdt in een plaats of land.",
        "description": "Het feit dat een Persoon verblijf houdt in een plaats of land.",
        "operationId": "InwonerschapGET",
        "tags": [
          "OSLO"
        ],
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "description": "Identificator van een Inwonerschap object.",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Inwonerschap object gevonden.",
            "content": {
              "application/ld+json": {
                "schema": {
                  "$ref": "#/components/schemas/Inwonerschap"
                }
              }
            },
            "links": {
              "VerblijfplaatsGET": {
                "operationId": "VerblijfplaatsGET",
                "parameters": {
                  "id": "$response.body#/Inwonerschap.heeftVerblijfplaats/@id"
                },
                "description": "Het `@id` attribuut van de waarde van `Inwonerschap.heeftVerblijfplaats` kan gebruikt worden om het gerefereerde object van het type `Verblijfplaats` op te halen."
              }
            }
          },
          "400": {
            "description": "Ontbrekende informatie bij het opvragen een Inwonerschap object."
          },
          "404": {
            "description": "Inwonerschap object met gegeven ID niet gevonden."
          }
        }
      }
    },
    "/id/GeregistreerdPersoon/{id}": {
      "get": {
        "summary": "Persoon waarvan de gegevens zijn ingeschreven in een register.",
        "description": "Persoon waarvan de gegevens zijn ingeschreven in een register.",
        "operationId": "GeregistreerdPersoonGET",
        "tags": [
          "OSLO"
        ],
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "description": "Identificator van een GeregistreerdPersoon object.",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "GeregistreerdPersoon object gevonden.",
            "content": {
              "application/ld+json": {
                "schema": {
                  "$ref": "#/components/schemas/GeregistreerdPersoon"
                }
              }
            },
            "links": {
              "IdentificatorGET": {
                "operationId": "IdentificatorGET",
                "parameters": {
                  "id": "$response.body#/GeregistreerdPersoon.registratie/@id"
                },
                "description": "Het `@id` attribuut van de waarde van `GeregistreerdPersoon.registratie` kan gebruikt worden om het gerefereerde object van het type `Identificator` op te halen."
              },
              "ContactpuntGET": {
                "operationId": "ContactpuntGET",
                "parameters": {
                  "id": "$response.body#/GeregistreerdPersoon.contactinfo/@id"
                },
                "description": "Het `@id` attribuut van de waarde van `GeregistreerdPersoon.contactinfo` kan gebruikt worden om het gerefereerde object van het type `Contactpunt` op te halen."
              },
              "GeboorteGET": {
                "operationId": "GeboorteGET",
                "parameters": {
                  "id": "$response.body#/GeregistreerdPersoon.heeftGeboorte/@id"
                },
                "description": "Het `@id` attribuut van de waarde van `GeregistreerdPersoon.heeftGeboorte` kan gebruikt worden om het gerefereerde object van het type `Geboorte` op te halen."
              },
              "InwonerschapGET": {
                "operationId": "InwonerschapGET",
                "parameters": {
                  "id": "$response.body#/GeregistreerdPersoon.inwonerschap/@id"
                },
                "description": "Het `@id` attribuut van de waarde van `GeregistreerdPersoon.inwonerschap` kan gebruikt worden om het gerefereerde object van het type `Inwonerschap` op te halen."
              },
              "WerkvoorkeurenGET": {
                "operationId": "WerkvoorkeurenGET",
                "parameters": {
                  "id": "$response.body#/GeregistreerdPersoon.werkvoorkeuren/@id"
                },
                "description": "Het `@id` attribuut van de waarde van `GeregistreerdPersoon.werkvoorkeuren` kan gebruikt worden om het gerefereerde object van het type `Werkvoorkeuren` op te halen."
              }
            }
          },
          "400": {
            "description": "Ontbrekende informatie bij het opvragen een GeregistreerdPersoon object."
          },
          "404": {
            "description": "GeregistreerdPersoon object met gegeven ID niet gevonden."
          }
        }
      }
    },
    "/id/Agent/{id}": {
      "get": {
        "summary": "Een agent zoals een Persoon, groep, software of fysiek artifact.",
        "description": "Een agent zoals een Persoon, groep, software of fysiek artifact.",
        "operationId": "AgentGET",
        "tags": [
          "Externe datastandaarden"
        ],
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "description": "Identificator van een Agent object.",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Agent object gevonden.",
            "content": {
              "application/ld+json": {
                "schema": {
                  "$ref": "#/components/schemas/Agent"
                }
              }
            },
            "links": {}
          },
          "400": {
            "description": "Ontbrekende informatie bij het opvragen een Agent object."
          },
          "404": {
            "description": "Agent object met gegeven ID niet gevonden."
          }
        }
      }
    },
    "/id/Domicilie/{id}": {
      "get": {
        "summary": "Hoofdverblijfplaats van een Persoon.",
        "description": "Hoofdverblijfplaats van een Persoon.",
        "operationId": "DomicilieGET",
        "tags": [
          "OSLO"
        ],
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "description": "Identificator van een Domicilie object.",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Domicilie object gevonden.",
            "content": {
              "application/ld+json": {
                "schema": {
                  "$ref": "#/components/schemas/Domicilie"
                }
              }
            },
            "links": {
              "AdresvoorstellingGET": {
                "operationId": "AdresvoorstellingGET",
                "parameters": {
                  "id": "$response.body#/Domicilie.verblijfsadres/@id"
                },
                "description": "Het `@id` attribuut van de waarde van `Domicilie.verblijfsadres` kan gebruikt worden om het gerefereerde object van het type `Adresvoorstelling` op te halen."
              }
            }
          },
          "400": {
            "description": "Ontbrekende informatie bij het opvragen een Domicilie object."
          },
          "404": {
            "description": "Domicilie object met gegeven ID niet gevonden."
          }
        }
      }
    },
    "/id/Persoon/{id}": {
      "get": {
        "summary": "Natuurlijk persoon.",
        "description": "Natuurlijk persoon.",
        "operationId": "PersoonGET",
        "tags": [
          "Externe datastandaarden"
        ],
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "description": "Identificator van een Persoon object.",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Persoon object gevonden.",
            "content": {
              "application/ld+json": {
                "schema": {
                  "$ref": "#/components/schemas/Persoon"
                }
              }
            },
            "links": {
              "GeboorteGET": {
                "operationId": "GeboorteGET",
                "parameters": {
                  "id": "$response.body#/Persoon.heeftGeboorte/@id"
                },
                "description": "Het `@id` attribuut van de waarde van `Persoon.heeftGeboorte` kan gebruikt worden om het gerefereerde object van het type `Geboorte` op te halen."
              },
              "InwonerschapGET": {
                "operationId": "InwonerschapGET",
                "parameters": {
                  "id": "$response.body#/Persoon.inwonerschap/@id"
                },
                "description": "Het `@id` attribuut van de waarde van `Persoon.inwonerschap` kan gebruikt worden om het gerefereerde object van het type `Inwonerschap` op te halen."
              },
              "ContactpuntGET": {
                "operationId": "ContactpuntGET",
                "parameters": {
                  "id": "$response.body#/Persoon.contactinfo/@id"
                },
                "description": "Het `@id` attribuut van de waarde van `Persoon.contactinfo` kan gebruikt worden om het gerefereerde object van het type `Contactpunt` op te halen."
              }
            }
          },
          "400": {
            "description": "Ontbrekende informatie bij het opvragen een Persoon object."
          },
          "404": {
            "description": "Persoon object met gegeven ID niet gevonden."
          }
        }
      }
    },
    "/id/Werkvoorkeuren/{id}": {
      "get": {
        "summary": "De voorkeuren van de Werkzoekende bij het zoeken naar werk.",
        "description": "De voorkeuren van de Werkzoekende bij het zoeken naar werk.",
        "operationId": "WerkvoorkeurenGET",
        "tags": [
          "OSLO"
        ],
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "description": "Identificator van een Werkvoorkeuren object.",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Werkvoorkeuren object gevonden.",
            "content": {
              "application/ld+json": {
                "schema": {
                  "$ref": "#/components/schemas/Werkvoorkeuren"
                }
              }
            },
            "links": {
              "BeroepstoestandGET": {
                "operationId": "BeroepstoestandGET",
                "parameters": {
                  "id": "$response.body#/Werkvoorkeuren.beroep/@id"
                },
                "description": "Het `@id` attribuut van de waarde van `Werkvoorkeuren.beroep` kan gebruikt worden om het gerefereerde object van het type `Beroepstoestand` op te halen."
              }
            }
          },
          "400": {
            "description": "Ontbrekende informatie bij het opvragen een Werkvoorkeuren object."
          },
          "404": {
            "description": "Werkvoorkeuren object met gegeven ID niet gevonden."
          }
        }
      }
    },
    "/id/Plaats/{id}": {
      "get": {
        "summary": "Een ruimtelijk gebied of benoemde plaats.",
        "description": "Een ruimtelijk gebied of benoemde plaats.",
        "operationId": "PlaatsGET",
        "tags": [
          "Externe datastandaarden"
        ],
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "description": "Identificator van een Plaats object.",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Plaats object gevonden.",
            "content": {
              "application/ld+json": {
                "schema": {
                  "$ref": "#/components/schemas/Plaats"
                }
              }
            },
            "links": {}
          },
          "400": {
            "description": "Ontbrekende informatie bij het opvragen een Plaats object."
          },
          "404": {
            "description": "Plaats object met gegeven ID niet gevonden."
          }
        }
      }
    },
    "/id/Activeringstraject/{id}": {
      "get": {
        "summary": "Een Activeringstraject is een specifiekere variant van een Traject dat moet aansporen om de Werkzoekende te activeren naar werk.",
        "description": "Een Activeringstraject is een specifiekere variant van een Traject dat moet aansporen om de Werkzoekende te activeren naar werk.",
        "operationId": "ActiveringstrajectGET",
        "tags": [
          "OSLO"
        ],
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "description": "Identificator van een Activeringstraject object.",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Activeringstraject object gevonden.",
            "content": {
              "application/ld+json": {
                "schema": {
                  "$ref": "#/components/schemas/Activeringstraject"
                }
              }
            },
            "links": {
              "TrajectstatustypeGET": {
                "operationId": "TrajectstatustypeGET",
                "parameters": {
                  "id": "$response.body#/Activeringstraject.status/@id"
                },
                "description": "Het `@id` attribuut van de waarde van `Activeringstraject.status` kan gebruikt worden om het gerefereerde object van het type `Trajectstatustype` op te halen."
              },
              "DeeltrajectGET": {
                "operationId": "DeeltrajectGET",
                "parameters": {
                  "id": "$response.body#/Activeringstraject.deeltraject/@id"
                },
                "description": "Het `@id` attribuut van de waarde van `Activeringstraject.deeltraject` kan gebruikt worden om het gerefereerde object van het type `Deeltraject` op te halen."
              },
              "ParticipatieGET": {
                "operationId": "ParticipatieGET",
                "parameters": {
                  "id": "$response.body#/Activeringstraject.heeftParticipatie/@id"
                },
                "description": "Het `@id` attribuut van de waarde van `Activeringstraject.heeftParticipatie` kan gebruikt worden om het gerefereerde object van het type `Participatie` op te halen."
              }
            }
          },
          "400": {
            "description": "Ontbrekende informatie bij het opvragen een Activeringstraject object."
          },
          "404": {
            "description": "Activeringstraject object met gegeven ID niet gevonden."
          }
        }
      }
    },
    "/id/Deeltraject/{id}": {
      "get": {
        "summary": "Een Deeltraject is een onderdeel van een Traject dat een specfiek onderdeel uitwerkt van een Traject.",
        "description": "Een Deeltraject is een onderdeel van een Traject dat een specfiek onderdeel uitwerkt van een Traject.",
        "operationId": "DeeltrajectGET",
        "tags": [
          "OSLO"
        ],
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "description": "Identificator van een Deeltraject object.",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Deeltraject object gevonden.",
            "content": {
              "application/ld+json": {
                "schema": {
                  "$ref": "#/components/schemas/Deeltraject"
                }
              }
            },
            "links": {
              "TrajectstatustypeGET": {
                "operationId": "TrajectstatustypeGET",
                "parameters": {
                  "id": "$response.body#/Deeltraject.status/@id"
                },
                "description": "Het `@id` attribuut van de waarde van `Deeltraject.status` kan gebruikt worden om het gerefereerde object van het type `Trajectstatustype` op te halen."
              },
              "DeeltrajecttypeGET": {
                "operationId": "DeeltrajecttypeGET",
                "parameters": {
                  "id": "$response.body#/Deeltraject.type/@id"
                },
                "description": "Het `@id` attribuut van de waarde van `Deeltraject.type` kan gebruikt worden om het gerefereerde object van het type `Deeltrajecttype` op te halen."
              },
              "ParticipatieGET": {
                "operationId": "ParticipatieGET",
                "parameters": {
                  "id": "$response.body#/Deeltraject.heeftParticipatie/@id"
                },
                "description": "Het `@id` attribuut van de waarde van `Deeltraject.heeftParticipatie` kan gebruikt worden om het gerefereerde object van het type `Participatie` op te halen."
              }
            }
          },
          "400": {
            "description": "Ontbrekende informatie bij het opvragen een Deeltraject object."
          },
          "404": {
            "description": "Deeltraject object met gegeven ID niet gevonden."
          }
        }
      }
    },
    "/id/GeregistreerdeOrganisatie/{id}": {
      "get": {
        "summary": "Organisatie met een juridisch statuut vastgelegd door registratie. Vergelijk met een FormeleOrganisatie waarbij dit statuut ook op een andere manier verkregen kan zijn.",
        "description": "Organisatie met een juridisch statuut vastgelegd door registratie. Vergelijk met een FormeleOrganisatie waarbij dit statuut ook op een andere manier verkregen kan zijn.",
        "operationId": "GeregistreerdeOrganisatieGET",
        "tags": [
          "Externe datastandaarden"
        ],
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "description": "Identificator van een GeregistreerdeOrganisatie object.",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "GeregistreerdeOrganisatie object gevonden.",
            "content": {
              "application/ld+json": {
                "schema": {
                  "$ref": "#/components/schemas/GeregistreerdeOrganisatie"
                }
              }
            },
            "links": {
              "ContactpuntGET": {
                "operationId": "ContactpuntGET",
                "parameters": {
                  "id": "$response.body#/GeregistreerdeOrganisatie.contactinfo/@id"
                },
                "description": "Het `@id` attribuut van de waarde van `GeregistreerdeOrganisatie.contactinfo` kan gebruikt worden om het gerefereerde object van het type `Contactpunt` op te halen."
              },
              "IdentificatorGET": {
                "operationId": "IdentificatorGET",
                "parameters": {
                  "id": "$response.body#/GeregistreerdeOrganisatie.registratie/@id"
                },
                "description": "Het `@id` attribuut van de waarde van `GeregistreerdeOrganisatie.registratie` kan gebruikt worden om het gerefereerde object van het type `Identificator` op te halen."
              },
              "OrganisatieTypeGET": {
                "operationId": "OrganisatieTypeGET",
                "parameters": {
                  "id": "$response.body#/GeregistreerdeOrganisatie.type/@id"
                },
                "description": "Het `@id` attribuut van de waarde van `GeregistreerdeOrganisatie.type` kan gebruikt worden om het gerefereerde object van het type `OrganisatieType` op te halen."
              }
            }
          },
          "400": {
            "description": "Ontbrekende informatie bij het opvragen een GeregistreerdeOrganisatie object."
          },
          "404": {
            "description": "GeregistreerdeOrganisatie object met gegeven ID niet gevonden."
          }
        }
      }
    },
    "/id/PubliekeOrganisatie/{id}": {
      "get": {
        "summary": "Een Organisatie die volgens een wettelijk kader behoort tot de publieke sector, ongeacht het bestuursniveau waarop dat kader van kracht is.",
        "description": "Een Organisatie die volgens een wettelijk kader behoort tot de publieke sector, ongeacht het bestuursniveau waarop dat kader van kracht is.",
        "operationId": "PubliekeOrganisatieGET",
        "tags": [
          "Externe datastandaarden"
        ],
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "description": "Identificator van een PubliekeOrganisatie object.",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "PubliekeOrganisatie object gevonden.",
            "content": {
              "application/ld+json": {
                "schema": {
                  "$ref": "#/components/schemas/PubliekeOrganisatie"
                }
              }
            },
            "links": {
              "ContactpuntGET": {
                "operationId": "ContactpuntGET",
                "parameters": {
                  "id": "$response.body#/PubliekeOrganisatie.contactinfo/@id"
                },
                "description": "Het `@id` attribuut van de waarde van `PubliekeOrganisatie.contactinfo` kan gebruikt worden om het gerefereerde object van het type `Contactpunt` op te halen."
              },
              "OrganisatieTypeGET": {
                "operationId": "OrganisatieTypeGET",
                "parameters": {
                  "id": "$response.body#/PubliekeOrganisatie.type/@id"
                },
                "description": "Het `@id` attribuut van de waarde van `PubliekeOrganisatie.type` kan gebruikt worden om het gerefereerde object van het type `OrganisatieType` op te halen."
              },
              "IdentificatorGET": {
                "operationId": "IdentificatorGET",
                "parameters": {
                  "id": "$response.body#/PubliekeOrganisatie.identificator/@id"
                },
                "description": "Het `@id` attribuut van de waarde van `PubliekeOrganisatie.identificator` kan gebruikt worden om het gerefereerde object van het type `Identificator` op te halen."
              }
            }
          },
          "400": {
            "description": "Ontbrekende informatie bij het opvragen een PubliekeOrganisatie object."
          },
          "404": {
            "description": "PubliekeOrganisatie object met gegeven ID niet gevonden."
          }
        }
      }
    },
    "/id/PubliekeDienstverlening/{id}": {
      "get": {
        "summary": "Een publieke dienstverlening is een geheel van verplichte of optioneel uitgevoerde of uitvoerbare acties door of in naam van een publieke organisatie. De dienstverlening is ten bate van een individu, een bedrijf, een andere publieke organisatie of groepen.",
        "description": "Een publieke dienstverlening is een geheel van verplichte of optioneel uitgevoerde of uitvoerbare acties door of in naam van een publieke organisatie. De dienstverlening is ten bate van een individu, een bedrijf, een andere publieke organisatie of groepen.",
        "operationId": "PubliekeDienstverleningGET",
        "tags": [
          "Externe datastandaarden"
        ],
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "description": "Identificator van een PubliekeDienstverlening object.",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "PubliekeDienstverlening object gevonden.",
            "content": {
              "application/ld+json": {
                "schema": {
                  "$ref": "#/components/schemas/PubliekeDienstverlening"
                }
              }
            },
            "links": {
              "PubliekeOrganisatieGET": {
                "operationId": "PubliekeOrganisatieGET",
                "parameters": {
                  "id": "$response.body#/PubliekeDienstverlening.heeftVerantwoordelijke/@id"
                },
                "description": "Het `@id` attribuut van de waarde van `PubliekeDienstverlening.heeftVerantwoordelijke` kan gebruikt worden om het gerefereerde object van het type `PubliekeOrganisatie` op te halen."
              },
              "FinaliteitTypeGET": {
                "operationId": "FinaliteitTypeGET",
                "parameters": {
                  "id": "$response.body#/PubliekeDienstverlening.finaliteit/@id"
                },
                "description": "Het `@id` attribuut van de waarde van `PubliekeDienstverlening.finaliteit` kan gebruikt worden om het gerefereerde object van het type `FinaliteitType` op te halen."
              },
              "PubliekeDienstverleningtypeGET": {
                "operationId": "PubliekeDienstverleningtypeGET",
                "parameters": {
                  "id": "$response.body#/PubliekeDienstverlening.type/@id"
                },
                "description": "Het `@id` attribuut van de waarde van `PubliekeDienstverlening.type` kan gebruikt worden om het gerefereerde object van het type `PubliekeDienstverleningtype` op te halen."
              },
              "WerkvoorkeurenGET": {
                "operationId": "WerkvoorkeurenGET",
                "parameters": {
                  "id": "$response.body#/PubliekeDienstverlening.gebruikt/@id"
                },
                "description": "Het `@id` attribuut van de waarde van `PubliekeDienstverlening.gebruikt` kan gebruikt worden om het gerefereerde object van het type `Werkvoorkeuren` op te halen."
              },
              "ParticipatieGET": {
                "operationId": "ParticipatieGET",
                "parameters": {
                  "id": "$response.body#/PubliekeDienstverlening.heeftParticipatie/@id"
                },
                "description": "Het `@id` attribuut van de waarde van `PubliekeDienstverlening.heeftParticipatie` kan gebruikt worden om het gerefereerde object van het type `Participatie` op te halen."
              },
              "ActiveringstrajectGET": {
                "operationId": "ActiveringstrajectGET",
                "parameters": {
                  "id": "$response.body#/PubliekeDienstverlening.produceert/@id"
                },
                "description": "Het `@id` attribuut van de waarde van `PubliekeDienstverlening.produceert` kan gebruikt worden om het gerefereerde object van het type `Activeringstraject` op te halen."
              }
            }
          },
          "400": {
            "description": "Ontbrekende informatie bij het opvragen een PubliekeDienstverlening object."
          },
          "404": {
            "description": "PubliekeDienstverlening object met gegeven ID niet gevonden."
          }
        }
      }
    },
    "/id/Geboorte/{id}": {
      "get": {
        "summary": "Het ter wereld komen van een Persoon.",
        "description": "Het ter wereld komen van een Persoon.",
        "operationId": "GeboorteGET",
        "tags": [
          "Externe datastandaarden"
        ],
        "parameters": [
          {
            "name": "id",
            "required": true,
            "in": "path",
            "description": "Identificator van een Geboorte object.",
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Geboorte object gevonden.",
            "content": {
              "application/ld+json": {
                "schema": {
                  "$ref": "#/components/schemas/Geboorte"
                }
              }
            },
            "links": {
              "PlaatsGET": {
                "operationId": "PlaatsGET",
                "parameters": {
                  "id": "$response.body#/Geboorte.plaats/@id"
                },
                "description": "Het `@id` attribuut van de waarde van `Geboorte.plaats` kan gebruikt worden om het gerefereerde object van het type `Plaats` op te halen."
              }
            }
          },
          "400": {
            "description": "Ontbrekende informatie bij het opvragen een Geboorte object."
          },
          "404": {
            "description": "Geboorte object met gegeven ID niet gevonden."
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "Participatie": {
        "type": "object",
        "description": "De rol waarin een Agent deelneemt aan de Publieke Dienstverlening.",
        "properties": {
          "@context": {
            "type": "string",
            "format": "uri",
            "enum": [
              "http://example.com/context.jsonld"
            ]
          },
          "@id": {
            "type": "string",
            "format": "uri",
            "pattern": "^http:\\/\\/example\\.comid\\/Participatie\\/\\d"
          },
          "@type": {
            "type": "string",
            "description": "Object type (klasse)",
            "enum": [
              "Participatie"
            ]
          },
          "Participatie.rol": {
            "type": "array",
            "description": "Lijst van Participatietype items.",
            "items": {
              "type": "object",
              "description": "De functie van de Agent bij het deelnemen.",
              "properties": {
                "@id": {
                  "type": "string",
                  "format": "uri",
                  "pattern": "^http:\\/\\/example\\.comid\\/Participatietype\\/\\d"
                }
              },
              "required": [
                "@id"
              ]
            },
            "minItems": 0
          },
          "Participatie.heeftParticipant": {
            "type": "array",
            "description": "Lijst van Agent items.",
            "items": {
              "type": "object",
              "description": "De Agenten die deelnemen.",
              "properties": {
                "@id": {
                  "type": "string",
                  "format": "uri",
                  "pattern": "^http:\\/\\/example\\.comid\\/Agent\\/\\d"
                }
              },
              "required": [
                "@id"
              ]
            },
            "minItems": 0
          }
        },
        "required": [
          "@context",
          "@id",
          "@type"
        ]
      },
      "Verblijfplaats": {
        "type": "object",
        "description": "Plaats waar een Persoon al dan niet tijdelijk woont of logeert.",
        "properties": {
          "@context": {
            "type": "string",
            "format": "uri",
            "enum": [
              "http://example.com/context.jsonld"
            ]
          },
          "@id": {
            "type": "string",
            "format": "uri",
            "pattern": "^http:\\/\\/example\\.comid\\/Verblijfplaats\\/\\d"
          },
          "@type": {
            "type": "string",
            "description": "Object type (klasse)",
            "enum": [
              "Verblijfplaats"
            ]
          },
          "Verblijfplaats.verblijfsadres": {
            "type": "object",
            "description": "Plaats waar een persoon al dan niet tijdelijk woont of logeert.",
            "properties": {
              "@id": {
                "type": "string",
                "format": "uri",
                "pattern": "^http:\\/\\/example\\.comid\\/Adresvoorstelling\\/\\d"
              }
            },
            "required": [
              "@id"
            ]
          }
        },
        "required": [
          "@context",
          "@id",
          "@type",
          "Verblijfplaats.verblijfsadres"
        ]
      },
      "Inwonerschap": {
        "type": "object",
        "description": "Het feit dat een Persoon verblijf houdt in een plaats of land.",
        "properties": {
          "@context": {
            "type": "string",
            "format": "uri",
            "enum": [
              "http://example.com/context.jsonld"
            ]
          },
          "@id": {
            "type": "string",
            "format": "uri",
            "pattern": "^http:\\/\\/example\\.comid\\/Inwonerschap\\/\\d"
          },
          "@type": {
            "type": "string",
            "description": "Object type (klasse)",
            "enum": [
              "Inwonerschap"
            ]
          },
          "Inwonerschap.heeftVerblijfplaats": {
            "type": "array",
            "description": "Lijst van Verblijfplaats items.",
            "items": {
              "type": "object",
              "description": "Plaats waar een persoon verblijft.",
              "properties": {
                "@id": {
                  "type": "string",
                  "format": "uri",
                  "pattern": "^http:\\/\\/example\\.comid\\/Verblijfplaats\\/\\d"
                }
              },
              "required": [
                "@id"
              ]
            },
            "minItems": 0
          }
        },
        "required": [
          "@context",
          "@id",
          "@type"
        ]
      },
      "GeregistreerdPersoon": {
        "type": "object",
        "description": "Persoon waarvan de gegevens zijn ingeschreven in een register.",
        "properties": {
          "@context": {
            "type": "string",
            "format": "uri",
            "enum": [
              "http://example.com/context.jsonld"
            ]
          },
          "@id": {
            "type": "string",
            "format": "uri",
            "pattern": "^http:\\/\\/example\\.comid\\/GeregistreerdPersoon\\/\\d"
          },
          "@type": {
            "type": "string",
            "description": "Object type (klasse)",
            "enum": [
              "GeregistreerdPersoon"
            ]
          },
          "GeregistreerdPersoon.achternaam": {
            "type": "object",
            "description": "Gedeelte van de volledige naam van de Persoon ontvangen van de vorige generatie. Ook wel familienaam genoemd omdat de achternaam een familiale verwantschap aanduidt.",
            "properties": {
              "@value": {
                "type": "string"
              }
            },
            "required": [
              "@value"
            ]
          },
          "GeregistreerdPersoon.voornaam": {
            "type": "array",
            "description": "Lijst van String items.",
            "items": {
              "type": "object",
              "description": "Naam die een Persoon bij geboorte wordt gegeven. Onderscheidt de Persoon van de andere personen in de familie.",
              "properties": {
                "@value": {
                  "type": "string"
                }
              },
              "required": [
                "@value"
              ]
            },
            "minItems": 0
          },
          "GeregistreerdPersoon.registratie": {
            "type": "array",
            "description": "Lijst van Identificator items.",
            "items": {
              "type": "object",
              "description": "Identificatiecode van de persoon in het register.",
              "properties": {
                "@id": {
                  "type": "string",
                  "format": "uri",
                  "pattern": "^http:\\/\\/example\\.comid\\/Identificator\\/\\d"
                }
              },
              "required": [
                "@id"
              ]
            },
            "minItems": 1
          },
          "GeregistreerdPersoon.contactinfo": {
            "type": "object",
            "description": "Informatie zoals email, telefoon... die toelaat de Persoon te contacteren.",
            "properties": {
              "@id": {
                "type": "string",
                "format": "uri",
                "pattern": "^http:\\/\\/example\\.comid\\/Contactpunt\\/\\d"
              }
            },
            "required": [
              "@id"
            ]
          },
          "GeregistreerdPersoon.heeftGeboorte": {
            "type": "object",
            "description": "Verwijst naar de geboortegebeurtenis van de Persoon. Bevat vaak de geboortegevens van de Persoon.",
            "properties": {
              "@id": {
                "type": "string",
                "format": "uri",
                "pattern": "^http:\\/\\/example\\.comid\\/Geboorte\\/\\d"
              }
            },
            "required": [
              "@id"
            ]
          },
          "GeregistreerdPersoon.inwonerschap": {
            "type": "array",
            "description": "Lijst van Inwonerschap items.",
            "items": {
              "type": "object",
              "description": "Jurisdictie waarbinnen het Inwonerschap van de Persoon is gedefinieerd.",
              "properties": {
                "@id": {
                  "type": "string",
                  "format": "uri",
                  "pattern": "^http:\\/\\/example\\.comid\\/Inwonerschap\\/\\d"
                }
              },
              "required": [
                "@id"
              ]
            },
            "minItems": 0
          },
          "GeregistreerdPersoon.werkvoorkeuren": {
            "type": "array",
            "description": "Lijst van Werkvoorkeuren items.",
            "items": {
              "type": "object",
              "description": "De voorkeuren voor werk van een Persoon.",
              "properties": {
                "@id": {
                  "type": "string",
                  "format": "uri",
                  "pattern": "^http:\\/\\/example\\.comid\\/Werkvoorkeuren\\/\\d"
                }
              },
              "required": [
                "@id"
              ]
            },
            "minItems": 0
          }
        },
        "required": [
          "@context",
          "@id",
          "@type",
          "GeregistreerdPersoon.registratie",
          "GeregistreerdPersoon.contactinfo"
        ]
      },
      "Agent": {
        "type": "object",
        "description": "Een agent zoals een Persoon, groep, software of fysiek artifact.",
        "properties": {
          "@context": {
            "type": "string",
            "format": "uri",
            "enum": [
              "http://example.com/context.jsonld"
            ]
          },
          "@id": {
            "type": "string",
            "format": "uri",
            "pattern": "^http:\\/\\/example\\.comid\\/Agent\\/\\d"
          },
          "@type": {
            "type": "string",
            "description": "Object type (klasse)",
            "enum": [
              "Agent"
            ]
          }
        },
        "required": [
          "@context",
          "@id",
          "@type"
        ]
      },
      "Domicilie": {
        "type": "object",
        "description": "Hoofdverblijfplaats van een Persoon.",
        "properties": {
          "@context": {
            "type": "string",
            "format": "uri",
            "enum": [
              "http://example.com/context.jsonld"
            ]
          },
          "@id": {
            "type": "string",
            "format": "uri",
            "pattern": "^http:\\/\\/example\\.comid\\/Domicilie\\/\\d"
          },
          "@type": {
            "type": "string",
            "description": "Object type (klasse)",
            "enum": [
              "Domicilie"
            ]
          },
          "Domicilie.verblijfsadres": {
            "type": "object",
            "description": "Plaats waar een persoon al dan niet tijdelijk woont of logeert.",
            "properties": {
              "@id": {
                "type": "string",
                "format": "uri",
                "pattern": "^http:\\/\\/example\\.comid\\/Adresvoorstelling\\/\\d"
              }
            },
            "required": [
              "@id"
            ]
          }
        },
        "required": [
          "@context",
          "@id",
          "@type",
          "Domicilie.verblijfsadres"
        ]
      },
      "Persoon": {
        "type": "object",
        "description": "Natuurlijk persoon.",
        "properties": {
          "@context": {
            "type": "string",
            "format": "uri",
            "enum": [
              "http://example.com/context.jsonld"
            ]
          },
          "@id": {
            "type": "string",
            "format": "uri",
            "pattern": "^http:\\/\\/example\\.comid\\/Persoon\\/\\d"
          },
          "@type": {
            "type": "string",
            "description": "Object type (klasse)",
            "enum": [
              "Persoon"
            ]
          },
          "Persoon.achternaam": {
            "type": "object",
            "description": "Gedeelte van de volledige naam van de Persoon ontvangen van de vorige generatie. Ook wel familienaam genoemd omdat de achternaam een familiale verwantschap aanduidt.",
            "properties": {
              "@value": {
                "type": "string"
              }
            },
            "required": [
              "@value"
            ]
          },
          "Persoon.voornaam": {
            "type": "array",
            "description": "Lijst van String items.",
            "items": {
              "type": "object",
              "description": "Naam die een Persoon bij geboorte wordt gegeven. Onderscheidt de Persoon van de andere personen in de familie.",
              "properties": {
                "@value": {
                  "type": "string"
                }
              },
              "required": [
                "@value"
              ]
            },
            "minItems": 0
          },
          "Persoon.heeftGeboorte": {
            "type": "object",
            "description": "Verwijst naar de geboortegebeurtenis van de Persoon. Bevat vaak de geboortegevens van de Persoon.",
            "properties": {
              "@id": {
                "type": "string",
                "format": "uri",
                "pattern": "^http:\\/\\/example\\.comid\\/Geboorte\\/\\d"
              }
            },
            "required": [
              "@id"
            ]
          },
          "Persoon.inwonerschap": {
            "type": "array",
            "description": "Lijst van Inwonerschap items.",
            "items": {
              "type": "object",
              "description": "Jurisdictie waarbinnen het Inwonerschap van de Persoon is gedefinieerd.",
              "properties": {
                "@id": {
                  "type": "string",
                  "format": "uri",
                  "pattern": "^http:\\/\\/example\\.comid\\/Inwonerschap\\/\\d"
                }
              },
              "required": [
                "@id"
              ]
            },
            "minItems": 0
          },
          "Persoon.contactinfo": {
            "type": "object",
            "description": "Informatie zoals email, telefoon... die toelaat de Persoon te contacteren.",
            "properties": {
              "@id": {
                "type": "string",
                "format": "uri",
                "pattern": "^http:\\/\\/example\\.comid\\/Contactpunt\\/\\d"
              }
            },
            "required": [
              "@id"
            ]
          }
        },
        "required": [
          "@context",
          "@id",
          "@type",
          "Persoon.contactinfo"
        ]
      },
      "Werkvoorkeuren": {
        "type": "object",
        "description": "De voorkeuren van de Werkzoekende bij het zoeken naar werk.",
        "properties": {
          "@context": {
            "type": "string",
            "format": "uri",
            "enum": [
              "http://example.com/context.jsonld"
            ]
          },
          "@id": {
            "type": "string",
            "format": "uri",
            "pattern": "^http:\\/\\/example\\.comid\\/Werkvoorkeuren\\/\\d"
          },
          "@type": {
            "type": "string",
            "description": "Object type (klasse)",
            "enum": [
              "Werkvoorkeuren"
            ]
          },
          "Werkvoorkeuren.beroep": {
            "type": "array",
            "description": "Lijst van Beroepstoestand items.",
            "items": {
              "type": "object",
              "description": "Voorkeuren voor bepaalde beroepen.",
              "properties": {
                "@id": {
                  "type": "string",
                  "format": "uri",
                  "pattern": "^http:\\/\\/example\\.comid\\/Beroepstoestand\\/\\d"
                }
              },
              "required": [
                "@id"
              ]
            },
            "minItems": 0
          }
        },
        "required": [
          "@context",
          "@id",
          "@type"
        ]
      },
      "Plaats": {
        "type": "object",
        "description": "Een ruimtelijk gebied of benoemde plaats.",
        "properties": {
          "@context": {
            "type": "string",
            "format": "uri",
            "enum": [
              "http://example.com/context.jsonld"
            ]
          },
          "@id": {
            "type": "string",
            "format": "uri",
            "pattern": "^http:\\/\\/example\\.comid\\/Plaats\\/\\d"
          },
          "@type": {
            "type": "string",
            "description": "Object type (klasse)",
            "enum": [
              "Plaats"
            ]
          },
          "Plaats.plaatsnaam": {
            "type": "object",
            "description": "Naam van de plaats of van het gebied.",
            "properties": {
              "@value": {
                "type": "string"
              },
              "@language": {
                "type": "string",
                "enum": [
                  "nl"
                ]
              }
            },
            "required": [
              "@value",
              "@language"
            ]
          }
        },
        "required": [
          "@context",
          "@id",
          "@type",
          "Plaats.plaatsnaam"
        ]
      },
      "Activeringstraject": {
        "type": "object",
        "description": "Een Activeringstraject is een specifiekere variant van een Traject dat moet aansporen om de Werkzoekende te activeren naar werk.",
        "properties": {
          "@context": {
            "type": "string",
            "format": "uri",
            "enum": [
              "http://example.com/context.jsonld"
            ]
          },
          "@id": {
            "type": "string",
            "format": "uri",
            "pattern": "^http:\\/\\/example\\.comid\\/Activeringstraject\\/\\d"
          },
          "@type": {
            "type": "string",
            "description": "Object type (klasse)",
            "enum": [
              "Activeringstraject"
            ]
          },
          "Activeringstraject.naam": {
            "type": "object",
            "description": "De naam van een Traject.",
            "properties": {
              "@value": {
                "type": "string"
              },
              "@language": {
                "type": "string",
                "enum": [
                  "nl"
                ]
              }
            },
            "required": [
              "@value",
              "@language"
            ]
          },
          "Activeringstraject.startdatum": {
            "type": "object",
            "description": "De datum waarop het Traject start.",
            "properties": {
              "@value": {
                "type": "string",
                "format": "date-time"
              },
              "@type": {
                "type": "string",
                "enum": [
                  "DateTime"
                ]
              }
            },
            "required": [
              "@value",
              "@type"
            ]
          },
          "Activeringstraject.einddatum": {
            "type": "object",
            "description": "De datum waarop het Traject eindigt.",
            "properties": {
              "@value": {
                "type": "string",
                "format": "date-time"
              },
              "@type": {
                "type": "string",
                "enum": [
                  "DateTime"
                ]
              }
            },
            "required": [
              "@value",
              "@type"
            ]
          },
          "Activeringstraject.status": {
            "type": "object",
            "description": "De status van het Traject.",
            "properties": {
              "@id": {
                "type": "string",
                "format": "uri",
                "pattern": "^http:\\/\\/example\\.comid\\/Trajectstatustype\\/\\d"
              }
            },
            "required": [
              "@id"
            ]
          },
          "Activeringstraject.deeltraject": {
            "type": "array",
            "description": "Lijst van Deeltraject items.",
            "items": {
              "type": "object",
              "description": "De Deeltrajecten gelinkt aan dit Traject.",
              "properties": {
                "@id": {
                  "type": "string",
                  "format": "uri",
                  "pattern": "^http:\\/\\/example\\.comid\\/Deeltraject\\/\\d"
                }
              },
              "required": [
                "@id"
              ]
            },
            "minItems": 0
          },
          "Activeringstraject.heeftParticipatie": {
            "type": "array",
            "description": "Lijst van Participatie items.",
            "items": {
              "type": "object",
              "description": "De Agenten die deelnemen aan het Activeringstraject.",
              "properties": {
                "@id": {
                  "type": "string",
                  "format": "uri",
                  "pattern": "^http:\\/\\/example\\.comid\\/Participatie\\/\\d"
                }
              },
              "required": [
                "@id"
              ]
            },
            "minItems": 0
          }
        },
        "required": [
          "@context",
          "@id",
          "@type",
          "Activeringstraject.naam"
        ]
      },
      "Deeltraject": {
        "type": "object",
        "description": "Een Deeltraject is een onderdeel van een Traject dat een specfiek onderdeel uitwerkt van een Traject.",
        "properties": {
          "@context": {
            "type": "string",
            "format": "uri",
            "enum": [
              "http://example.com/context.jsonld"
            ]
          },
          "@id": {
            "type": "string",
            "format": "uri",
            "pattern": "^http:\\/\\/example\\.comid\\/Deeltraject\\/\\d"
          },
          "@type": {
            "type": "string",
            "description": "Object type (klasse)",
            "enum": [
              "Deeltraject"
            ]
          },
          "Deeltraject.einddatum": {
            "type": "object",
            "description": "De datum waarop het Traject eindigt.",
            "properties": {
              "@value": {
                "type": "string",
                "format": "date-time"
              },
              "@type": {
                "type": "string",
                "enum": [
                  "DateTime"
                ]
              }
            },
            "required": [
              "@value",
              "@type"
            ]
          },
          "Deeltraject.naam": {
            "type": "object",
            "description": "De naam van een Traject.",
            "properties": {
              "@value": {
                "type": "string"
              },
              "@language": {
                "type": "string",
                "enum": [
                  "nl"
                ]
              }
            },
            "required": [
              "@value",
              "@language"
            ]
          },
          "Deeltraject.startdatum": {
            "type": "object",
            "description": "De datum waarop het Traject start.",
            "properties": {
              "@value": {
                "type": "string",
                "format": "date-time"
              },
              "@type": {
                "type": "string",
                "enum": [
                  "DateTime"
                ]
              }
            },
            "required": [
              "@value",
              "@type"
            ]
          },
          "Deeltraject.status": {
            "type": "object",
            "description": "De status van het Traject.",
            "properties": {
              "@id": {
                "type": "string",
                "format": "uri",
                "pattern": "^http:\\/\\/example\\.comid\\/Trajectstatustype\\/\\d"
              }
            },
            "required": [
              "@id"
            ]
          },
          "Deeltraject.type": {
            "type": "object",
            "description": "Het soort Traject. Bijvoorbeeld: Opleiding, Interview, etc.",
            "properties": {
              "@id": {
                "type": "string",
                "format": "uri",
                "pattern": "^http:\\/\\/example\\.comid\\/Deeltrajecttype\\/\\d"
              }
            },
            "required": [
              "@id"
            ]
          },
          "Deeltraject.heeftParticipatie": {
            "type": "array",
            "description": "Lijst van Participatie items.",
            "items": {
              "type": "object",
              "description": "De Agenten die deelnemen aan het Deeltraject.",
              "properties": {
                "@id": {
                  "type": "string",
                  "format": "uri",
                  "pattern": "^http:\\/\\/example\\.comid\\/Participatie\\/\\d"
                }
              },
              "required": [
                "@id"
              ]
            },
            "minItems": 0
          }
        },
        "required": [
          "@context",
          "@id",
          "@type",
          "Deeltraject.naam"
        ]
      },
      "GeregistreerdeOrganisatie": {
        "type": "object",
        "description": "Organisatie met een juridisch statuut vastgelegd door registratie. Vergelijk met een FormeleOrganisatie waarbij dit statuut ook op een andere manier verkregen kan zijn.",
        "properties": {
          "@context": {
            "type": "string",
            "format": "uri",
            "enum": [
              "http://example.com/context.jsonld"
            ]
          },
          "@id": {
            "type": "string",
            "format": "uri",
            "pattern": "^http:\\/\\/example\\.comid\\/GeregistreerdeOrganisatie\\/\\d"
          },
          "@type": {
            "type": "string",
            "description": "Object type (klasse)",
            "enum": [
              "GeregistreerdeOrganisatie"
            ]
          },
          "GeregistreerdeOrganisatie.voorkeursnaam": {
            "type": "object",
            "description": "Naam waarmee de Organisatie bij voorkeur wordt aangeduid.",
            "properties": {
              "@value": {
                "type": "string"
              },
              "@language": {
                "type": "string",
                "enum": [
                  "nl"
                ]
              }
            },
            "required": [
              "@value",
              "@language"
            ]
          },
          "GeregistreerdeOrganisatie.contactinfo": {
            "type": "array",
            "description": "Lijst van Contactpunt items.",
            "items": {
              "type": "object",
              "description": "Informatie zoals email, telefoon... die toelaat de Organisatie te contacteren.",
              "properties": {
                "@id": {
                  "type": "string",
                  "format": "uri",
                  "pattern": "^http:\\/\\/example\\.comid\\/Contactpunt\\/\\d"
                }
              },
              "required": [
                "@id"
              ]
            },
            "minItems": 0
          },
          "GeregistreerdeOrganisatie.registratie": {
            "type": "object",
            "description": "Identificator dat de organisatie verkreeg bij registratie. In de KBO is dit het ondernemingsnummer.",
            "properties": {
              "@id": {
                "type": "string",
                "format": "uri",
                "pattern": "^http:\\/\\/example\\.comid\\/Identificator\\/\\d"
              }
            },
            "required": [
              "@id"
            ]
          },
          "GeregistreerdeOrganisatie.type": {
            "type": "array",
            "description": "Lijst van OrganisatieType items.",
            "items": {
              "type": "object",
              "description": "Het soort Organisatie.",
              "properties": {
                "@id": {
                  "type": "string",
                  "format": "uri",
                  "pattern": "^http:\\/\\/example\\.comid\\/OrganisatieType\\/\\d"
                }
              },
              "required": [
                "@id"
              ]
            },
            "minItems": 0
          }
        },
        "required": [
          "@context",
          "@id",
          "@type",
          "GeregistreerdeOrganisatie.voorkeursnaam",
          "GeregistreerdeOrganisatie.registratie"
        ]
      },
      "PubliekeOrganisatie": {
        "type": "object",
        "description": "Een Organisatie die volgens een wettelijk kader behoort tot de publieke sector, ongeacht het bestuursniveau waarop dat kader van kracht is.",
        "properties": {
          "@context": {
            "type": "string",
            "format": "uri",
            "enum": [
              "http://example.com/context.jsonld"
            ]
          },
          "@id": {
            "type": "string",
            "format": "uri",
            "pattern": "^http:\\/\\/example\\.comid\\/PubliekeOrganisatie\\/\\d"
          },
          "@type": {
            "type": "string",
            "description": "Object type (klasse)",
            "enum": [
              "PubliekeOrganisatie"
            ]
          },
          "PubliekeOrganisatie.voorkeursnaam": {
            "type": "object",
            "description": "Naam waarmee de Organisatie bij voorkeur wordt aangeduid.",
            "properties": {
              "@value": {
                "type": "string"
              },
              "@language": {
                "type": "string",
                "enum": [
                  "nl"
                ]
              }
            },
            "required": [
              "@value",
              "@language"
            ]
          },
          "PubliekeOrganisatie.contactinfo": {
            "type": "array",
            "description": "Lijst van Contactpunt items.",
            "items": {
              "type": "object",
              "description": "Informatie zoals email, telefoon... die toelaat de Organisatie te contacteren.",
              "properties": {
                "@id": {
                  "type": "string",
                  "format": "uri",
                  "pattern": "^http:\\/\\/example\\.comid\\/Contactpunt\\/\\d"
                }
              },
              "required": [
                "@id"
              ]
            },
            "minItems": 0
          },
          "PubliekeOrganisatie.type": {
            "type": "array",
            "description": "Lijst van OrganisatieType items.",
            "items": {
              "type": "object",
              "description": "Het soort Organisatie.",
              "properties": {
                "@id": {
                  "type": "string",
                  "format": "uri",
                  "pattern": "^http:\\/\\/example\\.comid\\/OrganisatieType\\/\\d"
                }
              },
              "required": [
                "@id"
              ]
            },
            "minItems": 0
          },
          "PubliekeOrganisatie.identificator": {
            "type": "object",
            "description": "Identificator dat de organisatie uniek indentificeert. In de KBO is dit het ondernemingsnummer.",
            "properties": {
              "@id": {
                "type": "string",
                "format": "uri",
                "pattern": "^http:\\/\\/example\\.comid\\/Identificator\\/\\d"
              }
            },
            "required": [
              "@id"
            ]
          }
        },
        "required": [
          "@context",
          "@id",
          "@type",
          "PubliekeOrganisatie.voorkeursnaam",
          "PubliekeOrganisatie.identificator"
        ]
      },
      "PubliekeDienstverlening": {
        "type": "object",
        "description": "Een publieke dienstverlening is een geheel van verplichte of optioneel uitgevoerde of uitvoerbare acties door of in naam van een publieke organisatie. De dienstverlening is ten bate van een individu, een bedrijf, een andere publieke organisatie of groepen.",
        "properties": {
          "@context": {
            "type": "string",
            "format": "uri",
            "enum": [
              "http://example.com/context.jsonld"
            ]
          },
          "@id": {
            "type": "string",
            "format": "uri",
            "pattern": "^http:\\/\\/example\\.comid\\/PubliekeDienstverlening\\/\\d"
          },
          "@type": {
            "type": "string",
            "description": "Object type (klasse)",
            "enum": [
              "PubliekeDienstverlening"
            ]
          },
          "PubliekeDienstverlening.naam": {
            "type": "object",
            "description": "De naam van de Publieke Dienstverlening.",
            "properties": {
              "@value": {
                "type": "string"
              },
              "@language": {
                "type": "string",
                "enum": [
                  "nl"
                ]
              }
            },
            "required": [
              "@value",
              "@language"
            ]
          },
          "PubliekeDienstverlening.heeftVerantwoordelijke": {
            "type": "object",
            "description": "De Publieke Organisatie die verantwoordelijk is voor de Publieke Dienstverlening.",
            "properties": {
              "@id": {
                "type": "string",
                "format": "uri",
                "pattern": "^http:\\/\\/example\\.comid\\/PubliekeOrganisatie\\/\\d"
              }
            },
            "required": [
              "@id"
            ]
          },
          "PubliekeDienstverlening.finaliteit": {
            "type": "object",
            "description": "Wettelijk kader waarvoor de informatie wordt bevraagd.",
            "properties": {
              "@id": {
                "type": "string",
                "format": "uri",
                "pattern": "^http:\\/\\/example\\.comid\\/FinaliteitType\\/\\d"
              }
            },
            "required": [
              "@id"
            ]
          },
          "PubliekeDienstverlening.type": {
            "type": "array",
            "description": "Lijst van PubliekeDienstverleningtype items.",
            "items": {
              "type": "object",
              "description": "Het soort Publieke Dienstverlening. Bijvoorbeeld: Orientatie, Begeleiding, etc.",
              "properties": {
                "@id": {
                  "type": "string",
                  "format": "uri",
                  "pattern": "^http:\\/\\/example\\.comid\\/PubliekeDienstverleningtype\\/\\d"
                }
              },
              "required": [
                "@id"
              ]
            },
            "minItems": 0
          },
          "PubliekeDienstverlening.gebruikt": {
            "type": "array",
            "description": "Lijst van Werkvoorkeuren items.",
            "items": {
              "type": "object",
              "description": "Referenties naar alle Inputs die de Publieke Dienstverlening gebruikt om een of meerdere Outputs te produceren.",
              "properties": {
                "@id": {
                  "type": "string",
                  "format": "uri",
                  "pattern": "^http:\\/\\/example\\.comid\\/Werkvoorkeuren\\/\\d"
                }
              },
              "required": [
                "@id"
              ]
            },
            "minItems": 0
          },
          "PubliekeDienstverlening.heeftParticipatie": {
            "type": "array",
            "description": "Lijst van Participatie items.",
            "items": {
              "type": "object",
              "description": "De Agenten die deelnemen aan de Publieke Dienstverlening.",
              "properties": {
                "@id": {
                  "type": "string",
                  "format": "uri",
                  "pattern": "^http:\\/\\/example\\.comid\\/Participatie\\/\\d"
                }
              },
              "required": [
                "@id"
              ]
            },
            "minItems": 0
          },
          "PubliekeDienstverlening.produceert": {
            "type": "array",
            "description": "Lijst van Activeringstraject items.",
            "items": {
              "type": "object",
              "description": "De referenties naar alle resources die de Publieke Dienstverlening produceert.",
              "properties": {
                "@id": {
                  "type": "string",
                  "format": "uri",
                  "pattern": "^http:\\/\\/example\\.comid\\/Activeringstraject\\/\\d"
                }
              },
              "required": [
                "@id"
              ]
            },
            "minItems": 0
          }
        },
        "required": [
          "@context",
          "@id",
          "@type",
          "PubliekeDienstverlening.naam",
          "PubliekeDienstverlening.heeftVerantwoordelijke"
        ]
      },
      "Geboorte": {
        "type": "object",
        "description": "Het ter wereld komen van een Persoon.",
        "properties": {
          "@context": {
            "type": "string",
            "format": "uri",
            "enum": [
              "http://example.com/context.jsonld"
            ]
          },
          "@id": {
            "type": "string",
            "format": "uri",
            "pattern": "^http:\\/\\/example\\.comid\\/Geboorte\\/\\d"
          },
          "@type": {
            "type": "string",
            "description": "Object type (klasse)",
            "enum": [
              "Geboorte"
            ]
          },
          "Geboorte.datum": {
            "type": "object",
            "description": "Datum waarop de gebeurtenis plaatsvond.",
            "properties": {
              "@value": {
                "type": "string",
                "format": "date-time"
              },
              "@type": {
                "type": "string",
                "enum": [
                  "DateTime"
                ]
              }
            },
            "required": [
              "@value",
              "@type"
            ]
          },
          "Geboorte.plaats": {
            "type": "object",
            "description": "Plaats waar de gebeurtenis plaatsvond. Doorgaans een land of stad.",
            "properties": {
              "@id": {
                "type": "string",
                "format": "uri",
                "pattern": "^http:\\/\\/example\\.comid\\/Plaats\\/\\d"
              }
            },
            "required": [
              "@id"
            ]
          }
        },
        "required": [
          "@context",
          "@id",
          "@type",
          "Geboorte.datum",
          "Geboorte.plaats"
        ]
      }
    }
  }
}
