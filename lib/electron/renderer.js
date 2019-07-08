'use strict';

const { spawn } = require('child_process');
const { remote } = require('electron');
const Tone = require('tone');
const ipc = require('node-ipc');
const ffmpegInstallation = require('@ffmpeg-installer/ffmpeg');
const pathsById = require('../pieces/paths-by-id');

const { pieceId } = remote.getCurrentWindow();

const ffmpegProcess = spawn(ffmpegInstallation.path, [
  '-i',
  '-',
  '-err_detect',
  'ignore_err',
  '-f',
  'mp3',
  'pipe:1',
]);

ffmpegProcess.stderr.on('data', d => {
  console.log(d.toString());
});
ffmpegProcess.on('error', err => {
  console.log(`Error: ${err.message}`);
});
ffmpegProcess.on('exit', () => {
  //TODO: wat do
});

ipc.config.id = 'stream.generative.fm.electron.renderer';
ipc.config.retry = 1500;
ipc.config.silent = true;

const destination = Tone.context.createMediaStreamDestination();
const recorder = new MediaRecorder(destination.stream);

recorder.ondataavailable = ({ data }) => {
  const fileReader = new FileReader();

  fileReader.onload = function handleFileReaderLoad() {
    ffmpegProcess.stdin.write(Buffer.from(this.result));
  };

  const blob = new Blob([data]);
  fileReader.readAsArrayBuffer(blob);
};

ipc.connectTo('stream.generative.fm.express', () => {
  ffmpegProcess.stdout.on('data', d => {
    ipc.of['stream.generative.fm.express'].emit(`${pieceId}::streamdata`, d);
  });
});

const makePiece = require(pathsById[pieceId]);
makePiece({
  audioContext: Tone.context,
  preferredFormat: 'ogg',
  destination,
}).then(() => {
  console.log('starting');
  Tone.Transport.start();
  recorder.start(100);
});
