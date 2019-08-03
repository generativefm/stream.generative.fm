'use strict';

const { app, BrowserWindow } = require('electron');
const ipc = require('node-ipc');

ipc.config.id = 'stream.generative.fm.electron.main';
ipc.config.retry = 1500;
ipc.config.silent = true;

const renderers = {};
app.on('ready', () => {
  ipc.connectTo('stream.generative.fm.express', () => {
    ipc.of['stream.generative.fm.express'].on('start-render', pieceId => {
      console.log('start request recieved');
      if (typeof renderers[pieceId] === 'undefined') {
        const renderer = new BrowserWindow({
          width: 800,
          height: 600,
          webPreferences: {
            nodeIntegration: true,
          },
        });
        renderer.pieceId = pieceId;
        renderer.loadFile('./index.html');
        renderers[pieceId] = renderer;
      }
    });

    ipc.of['stream.generative.fm.express'].on('stop-render', pieceId => {
      console.log('stop request recieved');
      if (typeof renderers[pieceId] !== 'undefined') {
        renderers[pieceId].close();
        delete renderers[pieceId];
      }
    });
  });
});
