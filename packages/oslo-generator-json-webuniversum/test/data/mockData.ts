export const jsonldClass = [
    {
        '@id': 'http://example.org/.well-known/id/class/1',
        'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
            '@id': 'http://example.org/id/class/1',
        },
        '@type': 'http://www.w3.org/2002/07/owl#Class',
        'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel': [
            {
                '@language': 'en',
                '@value': 'ApTestClass',
            },
        ],
        'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#vocLabel': [
            {
                '@language': 'en',
                '@value': 'VocTestClass',
            },
        ],
        'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#vocDefinition': [
            {
                '@language': 'en',
                '@value': 'VocDefinition',
            },
        ],
        'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apDefinition': [
            {
                '@language': 'en',
                '@value': 'ApDefinition',
            },
        ],
        'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#vocUsageNote': [
            {
                '@language': 'en',
                '@value': 'VocUsageNote',
            },
        ],
        'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apUsageNote': [
            {
                '@language': 'en',
                '@value': 'ApUsageNote',
            },
        ],
    },
    {
        '@id': 'http://example.org/.well-known/id/datatype/1',
        'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
            '@id': 'http://example.org/id/datatype/1',
        },
        '@type': 'http://www.w3.org/2000/01/rdf-schema#Datatype',
        'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel': [
            {
                '@language': 'en',
                '@value': 'ApDatatype',
            },
        ],
        'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#vocLabel': [
            {
                '@language': 'en',
                '@value': 'VocDatatype',
            },
        ],
        'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#vocDefinition': [
            {
                '@language': 'en',
                '@value': 'VocDatatypeDefinition',
            },
        ],
        'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apDefinition': [
            {
                '@language': 'en',
                '@value': 'ApDatatypeDefinition',
            },
        ],
        'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#vocUsageNote': [
            {
                '@language': 'en',
                '@value': 'VocDatatypeUsageNote',
            },
        ],
        'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apUsageNote': [
            {
                '@language': 'en',
                '@value': 'ApDatatypeUsageNote',
            },
        ],
    },
]

export const classWithoutAssignedURI = [
    {
        '@id': 'http://example.org/.well-known/id/class/1',
        '@type': 'http://www.w3.org/2002/07/owl#Class',
    },
]

export const classWithProperty = [
    {
        '@id': 'http://example.org/.well-known/id/class/1',
        'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
            '@id': 'http://example.org/id/class/1',
        },
        '@type': 'http://www.w3.org/2002/07/owl#Class',
        'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel': [
            {
                '@language': 'en',
                '@value': 'TestClass',
            },
        ],
    },
    {
        '@id': 'http://example.org/.well-known/id/class/2',
        'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
            '@id': 'http://example.org/id/class/2',
        },
        '@type': 'http://www.w3.org/2002/07/owl#Class',
        'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel': [
            {
                '@language': 'en',
                '@value': 'ApAnotherTestClass',
            },
        ],
        'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#vocLabel': [
            {
                '@language': 'en',
                '@value': 'VocAnotherTestClass',
            },
        ],
    },
    {
        '@id': 'http://example.org/.well-known/id/property/1',
        'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
            '@id': 'http://example.org/id/property/1',
        },
        '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
        'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel': [
            {
                '@language': 'en',
                '@value': 'TestProperty',
            },
        ],
        'http://www.w3.org/2000/01/rdf-schema#domain': [
            {
                '@id': 'http://example.org/.well-known/id/class/1',
            },
        ],
        'http://www.w3.org/2000/01/rdf-schema#range': {
            '@id': 'http://example.org/.well-known/id/class/2',
        },
        'http://w3.org/ns/shacl#maxCount': '*',
        'http://w3.org/ns/shacl#minCount': '1',
        'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#codelist': 'http://example.org/codelist/1',
    },
]

export const classWithPropertyWithoutRange = [
    {
        '@id': 'http://example.org/.well-known/id/class/1',
        'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
            '@id': 'http://example.org/id/class/1',
        },
        '@type': 'http://www.w3.org/2002/07/owl#Class',
        'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel': [
            {
                '@language': 'en',
                '@value': 'TestClass',
            },
        ],
    },
    {
        '@id': 'http://example.org/.well-known/id/property/1',
        'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
            '@id': 'http://example.org/id/property/1',
        },
        '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
        'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel': [
            {
                '@language': 'en',
                '@value': 'TestProperty',
            },
        ],
        'http://www.w3.org/2000/01/rdf-schema#domain': [
            {
                '@id': 'http://example.org/.well-known/id/class/1',
            },
        ],
        'http://w3.org/ns/shacl#maxCount': '*',
    },
]

export const classWithPropertyWithoutRangeAssignedURI = [
    {
        '@id': 'http://example.org/.well-known/id/class/1',
        'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
            '@id': 'http://example.org/id/class/1',
        },
        '@type': 'http://www.w3.org/2002/07/owl#Class',
        'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel': [
            {
                '@language': 'en',
                '@value': 'TestClass',
            },
        ],
    },
    {
        '@id': 'http://example.org/.well-known/id/class/2',
        '@type': 'http://www.w3.org/2002/07/owl#Class',
        'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel': [
            {
                '@language': 'en',
                '@value': 'AnotherTestClass',
            },
        ],
    },
    {
        '@id': 'http://example.org/.well-known/id/property/1',
        'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
            '@id': 'http://example.org/id/property/1',
        },
        '@type': 'http://www.w3.org/2002/07/owl#DatatypeProperty',
        'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel': [
            {
                '@language': 'en',
                '@value': 'TestProperty',
            },
        ],
        'http://www.w3.org/2000/01/rdf-schema#domain': [
            {
                '@id': 'http://example.org/.well-known/id/class/1',
            },
        ],
        'http://www.w3.org/2000/01/rdf-schema#range': {
            '@id': 'http://example.org/.well-known/id/class/2',
        },
        'http://w3.org/ns/shacl#maxCount': '*',
    },
]

export const classWithParent = [
    {
        '@id': 'http://example.org/.well-known/id/class/1',
        'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
            '@id': 'http://example.org/id/class/1',
        },
        '@type': 'http://www.w3.org/2002/07/owl#Class',
        'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel': [
            {
                '@language': 'en',
                '@value': 'TestClass',
            },
        ],
        'http://www.w3.org/2000/01/rdf-schema#subClassOf': {
            '@id': 'http://example.org/.well-known/id/class/2',
        },
    },
    {
        '@id': 'http://example.org/.well-known/id/class/2',
        'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#assignedURI': {
            '@id': 'http://example.org/id/class/2',
        },
        '@type': 'http://www.w3.org/2002/07/owl#Class',
        'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#apLabel': [
            {
                '@language': 'en',
                '@value': 'ApAnotherTestClass',
            },
        ],
        'https://implementatie.data.vlaanderen.be/ns/oslo-toolchain#vocLabel': [
            {
                '@language': 'en',
                '@value': 'VocAnotherTestClass',
            },
        ],
    },
]

export const classWithParentWithoutAssignedURI = [
    {
        '@id': 'http://example.org/.well-known/id/class/1',
        '@type': 'http://www.w3.org/2002/07/owl#Class',
    },
]