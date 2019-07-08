'use strict';

const paths = require('./paths');
const loadPieceManifest = require('./load-piece-manifest');

module.exports = paths.reduce((manifestsByPath, path) => {
  manifestsByPath[path] = loadPieceManifest(path);
  return manifestsByPath;
}, {});
