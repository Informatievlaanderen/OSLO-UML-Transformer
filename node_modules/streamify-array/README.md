# Streamify Array

[![npm version](https://badge.fury.io/js/streamify-array.svg)](https://www.npmjs.com/package/streamify-array)

Converts an array into a Node readable stream.

This is a very simple zero-dependency implementation.

## Usage

```javascript
const streamifyArray = require('streamify-array');

let stream = streamifyArray([ 'a', 'b', 'c' ]);
stream.on('data', (d) => console.log('Data: ' + d));
stream.on('end', () => console.log('Done!'))
```

## License
This software is written by [Ruben Taelman](http://rubensworks.net/).

This code is released under the [MIT license](http://opensource.org/licenses/MIT).
