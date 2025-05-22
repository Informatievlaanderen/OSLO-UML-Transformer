# eslint-plugin-extended

eslint-plugin-extended is a set of rules for ESLint.

## Installation

```bash
$ npm install eslint-plugin-extended
```

## Quick start

First you need to add eslint-plugin-extended as a plugin to your ESLint configuration. See the [ESLint documentation](http://eslint.org/docs/user-guide/configuring#configuring-plugins) for details how to do this.

### consistent-err-names

When using `err` as a parameter name, from time to time you want to use `err` as a prefix or a suffix, as shown in the following example.

```javascript
fs.readFile('/etc/passwd', (errReadFile, data) => {
  // ...
});
```

In these cases you want to make sure that `err` is consistently used as prefix or as suffix. For this, use the `consistent-err-names` rule and configure it to use `err` as `prefix` or as `suffix`. If you do not specify an option, the rule uses `prefix` as default.

```javascript
consistent-err-names: [ 2, 'prefix' ]
```

## Running the build

To build this module use [roboter](https://www.npmjs.com/package/roboter).

```bash
$ bot build-server
```

## License

The MIT License (MIT)
Copyright (c) 2015-2016 the native web.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
