const { spawn } = require('child_process');
const path = require('path');

const makeProcess = () => {
  const electronProcess = spawn(
    path.join(__dirname, '../../node_modules/.bin/electron'),
    [path.join(__dirname, './main.js')],
    { shell: true, stdio: ['pipe'] }
  );

  electronProcess.stdout.on('data', data => {
    console.log(data.toString());
  });

  electronProcess.stderr.on('data', data => {
    console.error(data.toString());
  });

  electronProcess.on('error', err => {
    console.error(err);
  });

  electronProcess.on('exit', code => {
    process.exit(code);
  });
};

module.exports = makeProcess;
