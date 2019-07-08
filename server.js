'use strict';

const express = require('express');
const ipc = require('node-ipc');
const makeElectronProcess = require('./lib/electron/make-process');
const manifests = require('./lib/pieces/manifests');
const server = express();
const PORT = 3000;

ipc.config.id = 'stream.generative.fm.express';
ipc.config.retry = 1500;
ipc.config.silent = true;
ipc.serve();
ipc.server.start();

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

server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

makeElectronProcess();

server.get('/music/alex-bainter-:pieceId', (req, res) => {
  const { pieceId } = req.params;
  if (!pieceIds.includes(pieceId)) {
    req.status(404).send('No such piece');
  } else {
    console.log(`${pieceId} connected`);
    res.set('Cache-Control', 'no-cache, no-store');
    res.set('Content-Type', 'audio/mpeg');

    const clients = clientsByPieceId[pieceId];

    if (clients.length === 0) {
      console.log(`Express: requesting renderer for ${pieceId}`);
      ipc.server.broadcast('start-render', pieceId);
    }

    res.on('close', () => {
      console.log(`${pieceId} closed`);
      const i = clients.indexOf(res);
      console.log(`index ${i}`);
      if (i >= 0) {
        clients.splice(i, 1);
        if (clients.length === 0) {
          console.log('stopping render');
          ipc.server.broadcast('stop-render', pieceId);
        }
      }
    });
    // res.on('end', () => {
    //   console.log(`${pieceId} ended`);
    //   const i = clients.indexOf(res);
    //   console.log(`index ${i}`);
    //   if (i >= 0) {
    //     clients.splice(i, 1);
    //   }
    // });
    clients.push(res);
  }
});
