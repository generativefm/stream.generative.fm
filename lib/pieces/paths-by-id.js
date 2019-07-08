'use strict';

const manifestsByPath = require('./manifests-by-path');

module.exports = Reflect.ownKeys(manifestsByPath).reduce((pathsById, path) => {
  const { id } = manifestsByPath[path];
  pathsById[id] = path;
  return pathsById;
}, {});
