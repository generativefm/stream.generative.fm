const { ipcRenderer } = require('electron');
const Tone = require('tone');
const makePiece = require('@generative-music/piece-homage');

const destination = Tone.context.createMediaStreamDestination();
const recorder = new MediaRecorder(destination.stream);

const fileReader = new FileReader();

fileReader.onload = function handleFileReaderLoad() {
  const buffer = Buffer.from(this.result);
  ipcRenderer.send('data', buffer);
};

recorder.ondataavailable = ({ data }) => {
  console.log(data);
  const blob = new Blob([data], { type: 'application/ogg' });
  fileReader.readAsArrayBuffer(blob);
};

makePiece({
  audioContext: Tone.context,
  preferredFormat: 'ogg',
  destination,
}).then(() => {
  console.log('starting');
  Tone.Transport.start();
  recorder.start(100);
});
