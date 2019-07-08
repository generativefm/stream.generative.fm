'use strict';

const manifestsByPath = require('./manifests-by-path');

module.exports = Reflect.ownKeys(manifestsByPath).map(
  path => manifestsByPath[path]
);
