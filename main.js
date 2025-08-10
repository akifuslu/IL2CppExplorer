// main.js
const { app, BrowserWindow, dialog, ipcMain, screen } = require('electron');
const { execFile } = require('child_process');
const fs = require('fs').promises;
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
      { env: { ...process.env, ...env }},
      (err, stdout, stderr) => {
        console.log('il2cpp stdout:\n', stdout);
        console.error('il2cpp stderr:\n', stderr);
        if (err) return reject(stderr || err);
        resolve(stdout);
      }
    );    
  });
});

ipcMain.handle('save-file', async (evt, { filePath, content }) => {
  // ensure directory exists, or just write directly:
  await fs.writeFile(filePath, content, 'utf8');
  return `Wrote ${content.length} bytes to ${filePath}`;
});

ipcMain.handle('read-file', async (evt, filePath) => {
  return fs.readFile(filePath, 'utf8');
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});
