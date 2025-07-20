// main.js
const { app, BrowserWindow, dialog, ipcMain, screen } = require('electron');
const { execFile } = require('child_process');
const path = require('path');


function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const win = new BrowserWindow({
    width,
    height,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),     
      sandbox: false,
      nodeIntegration: false,
      contextIsolation: true,
    },
  });
  win.loadFile('index.html');
  win.webContents.openDevTools({ mode: 'right' });
  win.on('close', () => {
    app.quit();
  });
}


// handle the directory‐picker request
ipcMain.handle('select-unity-dir', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });
  return canceled ? null : filePaths[0];
});

ipcMain.handle('run-script', (evt, { args, env }) => {
  const script = path.join(__dirname, 'il2cpp_compile.sh');
  return new Promise((resolve, reject) => {
    execFile(
      script,
      { env: { ...process.env, ...env } },  // options in arg #2
      (err, stdout, stderr) => {
        if (err) return reject(stderr || err);
        resolve(stdout);
      }
    );    
  });
});


app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});
