const { app, BrowserWindow, ipcMain } = require('electron');
const ipc = require('node-ipc');

ipc.config.id = 'stream.generative.fm.electron';
ipc.config.retry = 1500;
ipc.config.silent = true;

const ipcConnectionPromise = new Promise(resolve => {
  ipc.connectTo('stream.generative.fm.express', () => {
    resolve();
  });
});

const appReadyPromise = new Promise(resolve => {
  app.on('ready', () => {
    resolve();
  });
});

let mainWindow;

ipcMain.on('data', (event, buffer) => {
  ipc.of['stream.generative.fm.express'].emit('streamdata', buffer);
});

Promise.all([ipcConnectionPromise, appReadyPromise]).then(() => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true,
    },
  });
  mainWindow.loadFile('./index.html');
});
