'use strict';

const RuleTester = require('eslint').RuleTester;

const rule = require('../lib/consistent-err-names');

const ruleTester = new RuleTester();

ruleTester.run('consistent-err-names', rule, {
  valid: [
    { code: '(function (err) {})()' },
    { code: '(function (err) {})()', options: [ 'prefix' ]},
    { code: '(function (err) {})()', options: [ 'suffix' ]},
    { code: '(function (error) {})()' },
    { code: '(function (error) {})()', options: [ 'prefix' ]},
    { code: '(function (error) {})()', options: [ 'suffix' ]},
    { code: '(function (roerr) {})()' },
    { code: '(function (roerr) {})()', options: [ 'prefix' ]},
    { code: '(function (roerr) {})()', options: [ 'suffix' ]},
    { code: '(function (errFoo) {})()' },
    { code: '(function (errFoo) {})()', options: [ 'prefix' ]},
    { code: '(function (fooErr) {})()', options: [ 'suffix' ]},
    { code: '(function (foobar) {})()' },
    { code: '(function (foobar) {})()', options: [ 'prefix' ]},
    { code: '(function (foobar) {})()', options: [ 'suffix' ]},
    { code: '(function (hyperreduced) {})()' },
    { code: '(function (hyperreduced) {})()', options: [ 'prefix' ]},
    { code: '(function (hyperreduced) {})()', options: [ 'suffix' ]}
  ],

  invalid: [
    {
      code: '(function (barErr) {})()',
      errors: [{ message: 'Must start with err.' }]
    }, {
      code: '(function (barErr) {})()',
      errors: [{ message: 'Must start with err.' }],
      options: [ 'prefix' ]
    }, {
      code: '(function (errBar) {})()',
      errors: [{ message: 'Must end with err.' }],
      options: [ 'suffix' ]
    }, {
      code: '(function (fooErrBar) {})()',
      errors: [{ message: 'Must not contain err.' }],
      options: [ 'prefix' ]
    }
  ]
});
