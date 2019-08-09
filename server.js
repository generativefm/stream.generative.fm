'use strict';

const path = require('path');
const fs = require('fs').promises;
const { R_OK } = require('fs').constants;
const express = require('express');
const ipc = require('node-ipc');
const mimeTypes = require('mime-types');
const makeElectronProcess = require('./lib/electron/make-process');
const manifests = require('./lib/pieces/manifests');
const { port } = require('./config.json');
const server = express();

server.set('view engine', 'ejs');

ipc.config.id = 'stream.generative.fm.express';
ipc.config.retry = 1500;
ipc.config.silent = true;
ipc.serve();
ipc.server.start();

const adjacentSamplePath = path.resolve('../samples.generative.fm/src/samples');

const checkSamplesPromise = fs.access(adjacentSamplePath, R_OK).catch(() => {
  console.log(
    `Local sample files not found (looked for ${adjacentSamplePath}). Music will not be playable!`
  );
  console.log(
    'To fix, clone https://github.com/generative-music/samples.generative.fm to a directory adjacent to this one.'
  );
  console.log('Then, run this script again.');
});

server.get('/samples/index.json', (req, res) => {
  fs.readFile(path.join(adjacentSamplePath, 'index.json'), 'utf8').then(
    data => {
      const samples = JSON.parse(data);
      Reflect.ownKeys(samples).forEach(instrumentName => {
        if (Array.isArray(samples[instrumentName])) {
          samples[instrumentName] = {
            wav: samples[instrumentName].map(url => `${instrumentName}/${url}`),
          };
        } else {
          samples[instrumentName] = {
            wav: Reflect.ownKeys(samples[instrumentName]).reduce(
              (wav, note) => {
                wav[
                  note
                ] = `${instrumentName}/${samples[instrumentName][note]}`;
                return wav;
              },
              {}
            ),
          };
        }
      });
      res.json({ samples });
    }
  );
});

server.get(['/', '/index.html'], (req, res) => {
  res.render('index.ejs', { manifests });
});

checkSamplesPromise.then(() => {
  server.use('/samples', express.static(adjacentSamplePath));
});

const pieceIds = manifests.map(({ id }) => id);

const clientsByPieceId = {};

pieceIds.forEach(id => {
  clientsByPieceId[id] = [];
  ipc.server.on(`${id}::streamdata`, message => {
    const buffer = Buffer.from(message.data);
    clientsByPieceId[id].forEach(client => {
      client.write(buffer, 'binary');
    });
  });
});

server.listen(port, () => console.log(`Server listening on port ${port}`));

makeElectronProcess();

server.get('/music/alex-bainter-:pieceId', (req, res) => {
  const { pieceId } = req.params;
  if (!pieceIds.includes(pieceId)) {
    req.status(404).send('No such piece');
  } else {
    res.set('Cache-Control', 'no-cache, no-store');
    res.set('Content-Type', 'audio/mpeg');

    const clients = clientsByPieceId[pieceId];

    if (clients.length === 0) {
      ipc.server.broadcast('start-render', pieceId);
    }

    const handleExit = () => {
      const i = clients.indexOf(res);
      if (i >= 0) {
        clients.splice(i, 1);
        if (clients.length === 0) {
          ipc.server.broadcast('stop-render', pieceId);
        }
      }
    };

    res.on('close', () => {
      setTimeout(() => {
        handleExit();
      }, 1000);
    });
    res.on('end', () => {
      setTimeout(() => {
        handleExit();
      }, 1000);
    });
    clients.push(res);
  }
});
