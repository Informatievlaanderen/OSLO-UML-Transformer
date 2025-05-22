# RDF Terms

[![Build status](https://github.com/rubensworks/rdf-terms.js/workflows/CI/badge.svg)](https://github.com/rubensworks/rdf-terms.js/actions?query=workflow%3ACI)
[![Coverage Status](https://coveralls.io/repos/github/rubensworks/rdf-terms.js/badge.svg?branch=master)](https://coveralls.io/github/rubensworks/rdf-terms.js?branch=master)
[![Mutation testing badge](https://badge.stryker-mutator.io/github.com/rubensworks/rdf-terms.js/master)](https://stryker-mutator.github.io)
[![npm version](https://badge.fury.io/js/rdf-terms.svg)](https://www.npmjs.com/package/rdf-terms) 

This package contains utility functions for handling
[RDFJS](https://github.com/rdfjs/representation-task-force/) terms of quads/triples.

## Usage

The following examples assume the following imports:
```javascript
import { DataFactory } from "rdf-data-factory";
import * as RdfTerms from "rdf-terms";

const factory = new DataFactory();
```

### Constants

```javascript
// Prints [ 'subject', 'predicate', 'object', 'graph' ]
console.log(RdfTerms.QUAD_TERM_NAMES);

// Prints [ 'subject', 'predicate', 'object' ]
console.log(RdfTerms.TRIPLE_TERM_NAMES);

// Prints [ 'NamedNode', 'BlankNode', 'Literal', 'Variable', 'DefaultGraph', 'Quad' ]
console.log(RdfTerms.TERM_TYPES);
```

### Get quad terms

Get all terms from a quad.

_A second optional parameter can be set to true to ignore graph terms in the default graph._

```javascript
// Outputs: [ namedNode('http://example.org/s'), namedNode('http://example.org/p'), literal('abc'), namedNode('http://example.org/g') ]
RdfTerms.getTerms(factory.quad(
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  literal('abc'),
  namedNode('http://example.org/g'),
));

// Outputs: [ namedNode('http://example.org/s'), namedNode('http://example.org/p'), literal('abc'), defaultGraph() ]
RdfTerms.getTerms(factory.triple(
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  literal('abc'),
));

// Outputs: [ namedNode('http://example.org/s'), namedNode('http://example.org/p'), literal('abc') ]
RdfTerms.getTerms(factory.triple(
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  literal('abc'),
), true);
```

### Get quad nested terms

Get all nested terms from a quad.
This means that if a quad's term is a nested term, instead of returning that quad, all nested terms will be included, recursively.

_A second optional parameter can be set to true to ignore graph terms in the default graph._

```javascript
// Outputs: [ namedNode('http://example.org/s'), namedNode('http://example.org/p'), literal('abc'), namedNode('http://example.org/g') ]
RdfTerms.getTerms(factory.quad(
  factory.quad(
    namedNode('http://example.org/a'),
    namedNode('http://example.org/b'),
    namedNode('http://example.org/c'),
    namedNode('http://example.org/d'),
  ),
  namedNode('http://example.org/p'),
  literal('abc'),
  namedNode('http://example.org/g'),
));

// Outputs: [ namedNode('http://example.org/a'), namedNode('http://example.org/b'), namedNode('http://example.org/c'), namedNode('http://example.org/d'), namedNode('http://example.org/s'), namedNode('http://example.org/p'), literal('abc'), defaultGraph() ]
```

### Get named quad terms

Get all terms from a quad labelled with the quad term name.

This is the reverse operation from `collectNamedTerms`.

```javascript
// Outputs: [ { subject: namedNode('http://example.org/s') }, { predicate: namedNode('http://example.org/p') }, { object: literal('abc') }, { graph: namedNode('http://example.org/g') } ]
RdfTerms.getNamedTerms(factory.quad(
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  literal('abc'),
  namedNode('http://example.org/g'),
));
```

### Collect named quad terms

Create a quad from a an array of named quad terms.

This is the reverse operation from `getNamedTerms`.

_An second optional callback method can be provided to fill in missing terms_

```javascript
// Outputs: quad(namedNode('http://example.org/s'), namedNode('http://example.org/p'), literal('abc'), namedNode('http://example.org/g'))
RdfTerms.collectNamedTerms([
  { subject: factory.namedNode('http://example.org/s') },
  { predicate: factory.namedNode('http://example.org/p') },
  { object: factory.literal('abc') },
  { graph: factory.namedNode('http://example.org/g') },
]);

// Outputs: quad(namedNode('http://example.org/s'), namedNode('http://example.org/newNode'), literal('abc'), namedNode('http://example.org/g'))
RdfTerms.collectNamedTerms([
  { subject: factory.namedNode('http://example.org/s') },
  // Missing predicate
  { object: factory.literal('abc') },
  { graph: factory.namedNode('http://example.org/g') },
], (termName) => factory.namedNode('http://example.org/newNode'));
```

_An third optional argument can be passed to set a custom data factory_

```javascript
RdfTerms.collectNamedTerms([
  { subject: factory.namedNode('http://example.org/s') },
  { predicate: factory.namedNode('http://example.org/p') },
  { object: factory.literal('abc') },
  { graph: factory.namedNode('http://example.org/g') },
], null, myDataFactory);
```

### Iterate over quad terms

Invokes a callback for each term in the quad.

```javascript
// Outputs:
// subject: http://example.org/s
// predicate: http://example.org/p
// object: abc
// graph: http://example.org/g
RdfTerms.forEachTerms(factory.quad(
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  literal('abc'),
  namedNode('http://example.org/g'),
), (value, key) => console.log(key + ': ' + value.value));
```

### Iterate over nested quad terms

Invokes a callback for each term in the quad, while recursing into quoted triples.

```javascript
// Outputs:
// [subject]: http://example.org/s
// [predicate]: http://example.org/p
// [object, subject]: http://example.org/s1
// [object, predicate]: http://example.org/p1
// [object, object]: abc
// [graph]: http://example.org/g
RdfTerms.forEachTermsNested(factory.quad(
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  factory.quad(
    namedNode('http://example.org/s1'),
    namedNode('http://example.org/p1'),
    literal('abc'),
  ),
  namedNode('http://example.org/g'),
), (value, keys) => console.log(keys + ': ' + value.value));
```

### Filter quad terms

Returns all quad terms that return true for a given filter.

```javascript
// Output: [namedNode('http://example.org/p')]
RdfTerms.filterTerms(factory.quad(
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  literal('abc'),
  namedNode('http://example.org/g'),
), (value, key) => key === 'predicate');
```

### Filter nested quad terms

Returns all quad terms that return true for a given filter, while recursing into quoted triples.

```javascript
// Output: [namedNode('http://example.org/p'), namedNode('http://example.org/p1')]
RdfTerms.filterTermsNested(factory.quad(
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  factory.quad(
    namedNode('http://example.org/s1'),
    namedNode('http://example.org/p1'),
    literal('abc'),
  ),
  namedNode('http://example.org/g'),
), (value, keys) => keys[keys.length - 1] === 'predicate');
```

### Filter quad term names

Returns all quad term names that return true for a given filter.

```javascript
// Output: ['predicate']
RdfTerms.filterQuadTermNames(factory.quad(
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  literal('abc'),
  namedNode('http://example.org/g'),
), (value, key) => value.equals(namedNode('http://example.org/p')));
```

### Filter nested quad term names

Returns all quad term names that return true for a given filter, while recursing into quoted triples.

```javascript
// Output: [ ['predicate'], ['object', 'predicate'] ]
RdfTerms.filterQuadTermNamesNested(factory.quad(
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  factory.quad(
    namedNode('http://example.org/s1'),
    namedNode('http://example.org/p1'),
    literal('abc'),
  ),
  namedNode('http://example.org/g'),
), (value, keys) => value.equals(namedNode('http://example.org/p')));
```

### Map quad terms

Map all quad terms to form a new quad.

```javascript
// Output: quad(namedNode('http://subject'), namedNode('http://predicate'), namedNode('http://object'), namedNode('http://graph'))
RdfTerms.mapTerms(factory.quad(
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  literal('abc'),
  namedNode('http://example.org/g'),
), (value, key) => namedNode('http://' + key));
```

_An second optional argument can be passed to set a custom data factory_

```javascript
// Output: quad(namedNode('http://subject'), namedNode('http://predicate'), namedNode('http://object'), namedNode('http://graph'))
RdfTerms.mapTerms(factory.quad(
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  literal('abc'),
  namedNode('http://example.org/g'),
),
  (value, key) => namedNode('http://' + key),
  myDataFactory);
```

### Map nested quad terms

Map all quad terms to form a new quad, while recursing into quoted triples.

```javascript
// Output: quad(
//   namedNode('http://subject'),
//   namedNode('http://predicate'),
//   quad(namedNode('http://object-subject'), namedNode('http://object-predicate'), namedNode('http://object-object'), namedNode('http://object-graph')),
//   namedNode('http://graph'),
// )
RdfTerms.mapTerms(factory.quad(
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  factory.quad(
    namedNode('http://example.org/s1'),
    namedNode('http://example.org/p1'),
    literal('abc'),
  ),
  namedNode('http://example.org/g'),
), (value, keys) => namedNode('http://' + keys.join('-')));
```

### Reduce quad terms

Reduce the quad terms to a single value.

```javascript
// Output: "START: http://example.org/s, http://example.org/p, abc, http://example.org/g"
RdfTerms.reduceTerms(factory.quad(
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  literal('abc'),
  namedNode('http://example.org/g'),
), (previous, value, key) => previous + ', ' + value.value, 'START: ');
```

### Reduce nested quad terms

Reduce the quad terms to a single value, while recursing into quoted triples.

```javascript
// Output: "START: http://example.org/s, http://example.org/p, http://example.org/s1, http://example.org/p1, abc, abc, http://example.org/g"
RdfTerms.reduceTerms(factory.quad(
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  factory.quad(
    namedNode('http://example.org/s1'),
    namedNode('http://example.org/p1'),
    literal('abc'),
  ),
  namedNode('http://example.org/g'),
), (previous, value, key) => previous + ', ' + value.value, 'START: ');
```

### Every quad terms

Determines whether all terms satisfy the specified test.

```javascript
// Output: false
RdfTerms.everyTerms(factory.quad(
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  literal('abc'),
  namedNode('http://example.org/g'),
), (value, key) => value.termType === 'NamedNode');

// Output: true
RdfTerms.everyTerms(factory.quad(
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  namedNode('http://example.org/o'),
  namedNode('http://example.org/g'),
), (value, key) => value.termType === 'NamedNode');
```

### Every quoted quad terms

Determines whether all terms satisfy the specified test, while recursing into quoted triples.

```javascript
// Output: false
RdfTerms.everyTermsNested(factory.quad(
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  factory.quad(
    namedNode('http://example.org/s1'),
    namedNode('http://example.org/p1'),
    literal('abc'),
  ),
  namedNode('http://example.org/g'),
), (value, keys) => value.termType === 'NamedNode');

// Output: true
RdfTerms.everyTermsNested(factory.quad(
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  factory.quad(
    namedNode('http://example.org/s1'),
    namedNode('http://example.org/p1'),
    namedNode('http://example.org/o1'),
  ),
  namedNode('http://example.org/g'),
), (value, keys) => value.termType === 'NamedNode');
```

### Some quad terms

Determines whether at least one term satisfies the specified test.

```javascript
// Output: true
RdfTerms.someTerms(factory.quad(
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  literal('abc'),
  namedNode('http://example.org/g'),
), (value, key) => value.termType === 'NamedNode');

// Output: true
RdfTerms.someTerms(factory.quad(
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  namedNode('http://example.org/o'),
  namedNode('http://example.org/g'),
), (value, key) => value.termType === 'NamedNode');

// Output: false
RdfTerms.someTerms(factory.quad(
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  namedNode('http://example.org/o'),
  namedNode('http://example.org/g'),
), (value, key) => value.termType === 'Variable');
```

### Some nested quad terms

Determines whether at least one term satisfies the specified test, while recursing into quoted triples.

```javascript
// Output: true
RdfTerms.someTermsNested(factory.quad(
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  factory.quad(
    namedNode('http://example.org/s1'),
    namedNode('http://example.org/p1'),
    literal('abc'),
  ),
  namedNode('http://example.org/g'),
), (value, keys) => value.termType === 'Literal');

// Output: false
RdfTerms.someTermsNested(factory.quad(
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  factory.quad(
    namedNode('http://example.org/s1'),
    namedNode('http://example.org/p1'),
    namedNode('http://example.org/o1'),
  ),
  namedNode('http://example.org/g'),
), (value, keys) => value.termType === 'Literal');
```

### Get value in nested path

Get the nested value inside a quoted triple by the given path of quad keys.

```javascript
// Output: literal('abc')
RdfTerms.getValueNestedPath(factory.quad(
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  factory.quad(
    namedNode('http://example.org/s1'),
    namedNode('http://example.org/p1'),
    factory.quad(
      namedNode('http://example.org/s1'),
      namedNode('http://example.org/p1'),
      literal('abc'),
    ),
  ),
  namedNode('http://example.org/g'),
), [ 'object', 'object', 'object' ]);
```

### Match term

Determines if the given term matches with the given **term**.

```javascript
// Output: true
RdfTerms.matchTerm(
  namedNode('http://example.org/s'),
  undefined,
);

// Output: true
RdfTerms.matchTerm(
  namedNode('http://example.org/s'),
  variable('v'),
);

// Output: true
RdfTerms.matchTerm(
  namedNode('http://example.org/s'),
  namedNode('http://example.org/s'),
);

// Output: true
RdfTerms.matchTerm(
  factory.quad(
    namedNode('http://example.org/s'),
    namedNode('http://example.org/p'),
    literal('abc'),
    namedNode('http://example.org/g'),
  ),
  factory.quad(
    namedNode('http://example.org/s'),
    namedNode('http://example.org/p'),
    variable('o'),
    namedNode('http://example.org/g'),
  ),
);
```

### Match pattern

Determines if the given quad matches with the given **quad terms**.

```javascript
// Output: true
RdfTerms.matchPattern(factory.quad(
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  literal('abc'),
  namedNode('http://example.org/g'),
),
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  literal('abc'),
  namedNode('http://example.org/g'),
);

// Output: true
RdfTerms.matchPattern(factory.quad(
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  literal('abc'),
  namedNode('http://example.org/g'),
),
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
);

// Output: true
RdfTerms.matchPattern(factory.quad(
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  literal('abc'),
  namedNode('http://example.org/g'),
),
  namedNode('http://example.org/s'),
  variable('someVariableP'),
  literal('abc'),
);

// Output: true
RdfTerms.matchPattern(factory.quad(
  factory.quad(
    namedNode('http://example.org/a'),
    namedNode('http://example.org/b'),
    namedNode('http://example.org/c'),
    namedNode('http://example.org/d'),
  ),
  namedNode('http://example.org/p'),
  literal('abc'),
  namedNode('http://example.org/g'),
),
  factory.quad(
    namedNode('http://example.org/a'),
    variable('someVariableP'),
    namedNode('http://example.org/c'),
    namedNode('http://example.org/d'),
  ),
  namedNode('http://example.org/p'),
  literal('abc'),
  namedNode('http://example.org/g'),
);


// Output: false
RdfTerms.matchPattern(factory.quad(
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  literal('abc'),
  namedNode('http://example.org/g'),
),
  namedNode('http://example.org/s'),
  variable('someVariableP'),
  literal('abcdef'),
);
```

### Match pattern complete

Determines if the given quad matches with the given **quad pattern** (_A quad that contains zero or more variables)_.

```javascript
// Output: true
RdfTerms.matchPatternComplete(factory.quad(
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  literal('abc'),
  namedNode('http://example.org/g'),
), factory.quad(
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  literal('abc'),
  namedNode('http://example.org/g'),
));

// Output: true
RdfTerms.matchPatternComplete(factory.quad(
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  literal('abc'),
  namedNode('http://example.org/g'),
), factory.quad(
  namedNode('http://example.org/s'),
  variable('varA'),
  literal('abc'),
  variable('varB'),
));

// Output: false
RdfTerms.matchPatternComplete(factory.quad(
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  literal('abc'),
  namedNode('http://example.org/g'),
), factory.quad(
  namedNode('http://example.org/s'),
  variable('varA'),
  literal('abcdef'),
  variable('varB'),
));
```

### Match pattern, taking into account variable mappings

Determines if the given quad matches with the given **quad pattern** (_A quad that contains zero or more variables)_,
by taking into account the mappings of the variables.
If the same variable occurs multiple times in the pattern,
then the corresponding terms in the quad must be equal.

```javascript
// Output: true
RdfTerms.matchPatternMappings(factory.quad(
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  literal('abc'),
  namedNode('http://example.org/g'),
), factory.quad(
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  literal('abc'),
  namedNode('http://example.org/g'),
));

// Output: true
RdfTerms.matchPatternComplete(factory.quad(
  namedNode('http://example.org/s'),
  namedNode('http://example.org/X'),
  literal('abc'),
  namedNode('http://example.org/X'),
), factory.quad(
  namedNode('http://example.org/s'),
  variable('varA'),
  literal('abc'),
  variable('varA'),
));

// Output: false
RdfTerms.matchPatternComplete(factory.quad(
  namedNode('http://example.org/s'),
  namedNode('http://example.org/X1'),
  literal('abc'),
  namedNode('http://example.org/X2'),
), factory.quad(
  namedNode('http://example.org/s'),
  variable('varA'),
  literal('abc'),
  variable('varA'),
));
```

There are also the following optional parameters
 - `skipVarMapping` - Don't add variables in the quad to the mapping
 - `returnMappings` - Return the mappings if it is a valid match

```javascript
// Output: {}
RdfTerms.matchPatternMappings(factory.quad(
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  literal('abc'),
  namedNode('http://example.org/g'),
), factory.quad(
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  literal('abc'),
  namedNode('http://example.org/g'),
), { returnMappings: true });

// Output: { s: namedNode('http://example.org/s') }
RdfTerms.matchPatternMappings(factory.quad(
  variable('s'),
  namedNode('http://example.org/p'),
  literal('abc'),
  namedNode('http://example.org/g'),
), factory.quad(
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  literal('abc'),
  namedNode('http://example.org/g'),
), { returnMappings: true });

// Output: { s: namedNode('http://example.org/s'), p: variable('o') }
RdfTerms.matchPatternMappings(factory.quad(
  variable('s'),
  namedNode('http://example.org/p'),
  variable('p'),
  namedNode('http://example.org/g'),
), factory.quad(
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  variable('o'),
  namedNode('http://example.org/g'),
), { returnMappings: true });

// Output: { s: namedNode('http://example.org/s') }
RdfTerms.matchPatternMappings(factory.quad(
  variable('s'),
  namedNode('http://example.org/p'),
  variable('p'),
  namedNode('http://example.org/g'),
), factory.quad(
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  variable('o'),
  namedNode('http://example.org/g'),
), { returnMappings: true, skipVarMapping: true });


const quadVariables = factory.quad(variable('s'), variable('p'), variable('o'), variable('g'));

// Output: False
RdfTerms.matchPatternMappings(
  factory.quad(quadVariables, variable('p'), variable('f'), variable('g')),
  factory.quad(quadVariables, variable('p'), variable('o'), variable('g')),
)

// Output: True
RdfTerms.matchPatternMappings(
  factory.quad(quadVariables, variable('p'), variable('f'), variable('g')),
  factory.quad(quadVariables, variable('p'), variable('o'), variable('g')),
  { skipVarMapping: true }
)
```

### Unique terms

Create an array of unique terms from the given array.

```javascript
// Output: [namedNode('http://example.org/s')]
RdfTerms.uniqTerms([
  namedNode('http://example.org/s'),
  namedNode('http://example.org/s'),
]);
```

### Get terms of type

Find all terms of the given type in the given array.

```javascript
// Output: [namedNode('http://example.org/s'), namedNode('http://example.org/p'), namedNode('http://example.org/g')]
RdfTerms.getTermsOfType([
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  literal('abc'),
  namedNode('http://example.org/g'),
], 'NamedNode');
```

_The functions `getNamedNodes`, `getBlankNodes`, `getLiterals`, `getVariables`, `getDefaultGraphs` are convenience variants of this function,
which do not require the term type string as parameter, and perform appropriate casting in TypeScript._

```javascript
// Output: [namedNode('http://example.org/s'), namedNode('http://example.org/p'), namedNode('http://example.org/g')]
RdfTerms.getNamedNodes([
  namedNode('http://example.org/s'),
  namedNode('http://example.org/p'),
  literal('abc'),
  namedNode('http://example.org/g'),
]);
```

## License
This software is written by [Ruben Taelman](http://rubensworks.net/).

This code is released under the [MIT license](http://opensource.org/licenses/MIT).
