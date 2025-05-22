'use strict';

const consistentErrorNames = require('./consistent-err-names');

module.exports = {
  rules: {
    'consistent-err-names': consistentErrorNames
  },
  rulesConfig: {
    'consistent-err-names': [ 2, 'prefix' ]
  }
};
