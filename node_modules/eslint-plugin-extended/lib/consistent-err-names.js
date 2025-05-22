'use strict';

const varname = require('varname');

const consistentErrorNames = function (context) {
  let mode;

  if (!context.options[0] || context.options[0] === 'prefix') {
    mode = 'prefix';
  } else if (context.options[0] === 'suffix') {
    mode = 'suffix';
  } else {
    throw new Error('Invalid options.');
  }

  return {
    Identifier (node) {
      const name = varname.dash(node.name);

      if (name.indexOf('err') === -1) {
        return;
      }
      if (name === 'err') {
        return;
      }
      if (/[^-]err/.test(name)) {
        return;
      }
      if (/err[^-]/.test(name)) {
        return;
      }

      if (/-err-/.test(name)) {
        /* eslint-disable consistent-return */
        return context.report(node, 'Must not contain err.');
        /* eslint-enable consistent-return */
      }

      if ((mode === 'prefix') && !/^err-/.test(name)) {
        /* eslint-disable consistent-return */
        return context.report(node, 'Must start with err.');
        /* eslint-enable consistent-return */
      }

      if ((mode === 'suffix') && !/-err$/.test(name)) {
        /* eslint-disable consistent-return */
        return context.report(node, 'Must end with err.');
        /* eslint-enable consistent-return */
      }

      return;
    }
  };
};

consistentErrorNames.schema = [
  {
    position: [ 'prefix', 'suffix' ]
  }
];

module.exports = consistentErrorNames;
