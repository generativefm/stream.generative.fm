'use strict';

/* eslint-disable global-require*/

const loadPieceManifest = requirePath => {
  const pkg = require(`${requirePath}/package.json`);
  const manifestFilename = pkg.generativeFmManifest;
  const manifest = require(`${requirePath}/${manifestFilename}`);
  return manifest;
};

module.exports = loadPieceManifest;
