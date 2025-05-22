# Arrayify Stream

[![Build status](https://github.com/rubensworks/arrayify-stream.js/workflows/CI/badge.svg)](https://github.com/rubensworks/arrayify-stream.js/actions?query=workflow%3ACI)
[![Coverage Status](https://coveralls.io/repos/github/rubensworks/arrayify-stream.js/badge.svg?branch=master)](https://coveralls.io/github/rubensworks/arrayify-stream.js?branch=master)
[![npm version](https://badge.fury.io/js/arrayify-stream.svg)](https://www.npmjs.com/package/arrayify-stream)

Converts a Node readable stream into an array that is returned as a promise.

This is a very simple zero-dependency implementation.

## Usage

```javascript
const arrayifyStream = require('arrayify-stream');
...
let myArray = await arrayifyStream(myStream);
```

## License
This software is written by [Ruben Taelman](http://rubensworks.net/).

This code is released under the [MIT license](http://opensource.org/licenses/MIT).
