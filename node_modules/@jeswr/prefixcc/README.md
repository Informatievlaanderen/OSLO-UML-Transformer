#  prefixcc

Get prefixes for your URIs using the [prefix.cc](http://prefix.cc/) Web API.

[![GitHub license](https://img.shields.io/github/license/jeswr/prefixcc.js.svg)](https://github.com/jeswr/prefixcc.js/blob/master/LICENSE)
[![npm version](https://img.shields.io/npm/v/@jeswr/prefixcc.svg)](https://www.npmjs.com/package/@jeswr/prefixcc)
[![build](https://img.shields.io/github/workflow/status/jeswr/prefixcc.js/Node.js%20CI)](https://github.com/jeswr/prefixcc.js/tree/main/)
[![Dependabot](https://badgen.net/badge/Dependabot/enabled/green?icon=dependabot)](https://dependabot.com/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

## Usage

Primarily this library can be used to look up common prefixes for a given URI, and also look up the URI most commonly associated with a prefix.

```ts
import { uriToPrefix, prefixToUri, lookupAllPrefixes } from '@jeswr/prefixcc'

const prefix = await uriToPrefix('http://xmlns.com/foaf/0.1/'); // foaf
const url = await prefixToUri('foaf');                          // http://xmlns.com/foaf/0.1/

// Returns an object with all prefixes recorded in prefix.cc
const prefixes = await lookupAllPrefixes(); // { ..., foaf: 'http://xmlns.com/foaf/0.1/', ... }
```

It can also mint new prefixes when there are no recommended ones available

```ts
await uriToPrefix('https://www.my-url/etad/', { mintOnUnknown: true }); // etad
```

and ensure that prefixes are unique from those that you're already using

```ts
await uriToPrefix(
  'https://www.my-url-2/etad/', {
    mintOnUnknown: true,
    existingPrefixes: { etad: 'https://www.my-url/etad/' }
}); // etad0

await uriToPrefix(
  'http://xmlns.com/foaf/0.1/', {
    existingPrefixes: { foaf: 'https://www.my-url/' }
}); // foaf0
```

## License
©2022–present
[Jesse Wright](https://github.com/jeswr),
[MIT License](https://github.com/jeswr/useState/blob/master/LICENSE).
