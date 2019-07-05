const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const express = require('express');
const ipc = require('node-ipc');
const ffmpegInstallation = require('@ffmpeg-installer/ffmpeg');
const makeProcess = require('./lib/electron/make-process');
const server = express();
const PORT = 3000;

ipc.config.id = 'stream.generative.fm.express';
ipc.config.retry = 1500;
ipc.config.silent = true;
ipc.serve();
ipc.server.start();

server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
const electronProcess = makeProcess();

const ffmpegProcess = spawn(ffmpegInstallation.path, [
  '-i',
  '-',
  '-f',
  'mp3',
  'pipe:1',
]);

ffmpegProcess.stderr.on('data', d => {
  //console.log(`stderr: ${d}`);
});
ffmpegProcess.on('error', err => {
  console.log(`Error: ${err.message}`);
});
ffmpegProcess.on('exit', (...args) => {
  console.log(args);
});

const clients = [];
ipc.server.on('streamdata', message => {
  ffmpegProcess.stdin.write(Buffer.from(message.data));
});

ffmpegProcess.stdout.on('data', d => {
  clients.forEach(client => {
    client.write(d, 'binary');
  });
});

server.get('/alex-bainter-homage', (req, res) => {
  res.set('Cache-Control', 'no-cache, no-store');
  res.set('Content-Type', 'audio/mpeg');
  res.on('close', () => {
    const i = clients.indexOf(res);
    if (i >= 0) {
      clients.splice(i, 0);
    }
  });
  clients.push(res);
});
