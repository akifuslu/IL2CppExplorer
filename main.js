// main.js
const { app, BrowserWindow, dialog, ipcMain, screen, shell } = require('electron');
const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

let mainWin = null;
let runningProc = null; // prevent parallel compile runs

function resolveAppPath(p) {
  if (app.isPackaged) return path.join(process.resourcesPath, p);
  return path.join(__dirname, p);
}

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWin = new BrowserWindow({
    width,
    height,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      sandbox: false,
      nodeIntegration: false,
      contextIsolation: true,
      devTools: true
    }
  });

  mainWin.once('ready-to-show', () => mainWin.show());
  mainWin.loadFile('index.html');

  // keep your devtools on the right
  mainWin.webContents.openDevTools({ mode: 'right' });

  // security: don’t allow new windows/popups
  mainWin.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));

  mainWin.on('closed', () => { mainWin = null; });
}

// ---- IPC ----

ipcMain.handle('select-unity-dir', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openDirectory', 'dontAddToRecent']
  });
  return canceled ? null : filePaths[0];
});

ipcMain.handle('save-file', async (_evt, { filePath, content }) => {
  await fs.mkdir(path.dirname(filePath), { recursive: true }).catch(() => { });
  await fs.writeFile(filePath, content, 'utf8');
  return `Wrote ${content.length} bytes to ${filePath}`;
});

ipcMain.handle('read-file', async (_evt, filePath) => {
  return fs.readFile(filePath, 'utf8');
});

// run il2cpp script with streaming logs
ipcMain.handle('run-script', async (_evt, { args = [], env = {}, cwd = __dirname }) => {
  if (runningProc) {
    throw new Error('A build is already running.');
  }

  const script = resolveAppPath('il2cpp_compile.sh');

  return new Promise((resolve, reject) => {
    try {
      runningProc = spawn(script, args, {
        cwd,
        env: { ...process.env, ...env },
        shell: false,
        stdio: ['ignore', 'pipe', 'pipe']
      });

      const outChunks = [];
      const errChunks = [];

      const send = (ch, data) => {
        if (mainWin && !mainWin.isDestroyed()) {
          mainWin.webContents.send(ch, data.toString());
        }
      };

      runningProc.stdout.on('data', (d) => { outChunks.push(d); send('proc:stdout', d); });
      runningProc.stderr.on('data', (d) => { errChunks.push(d); send('proc:stderr', d); });

      runningProc.on('error', (err) => {
        const msg = `Failed to start process:\n${err.message}`;
        if (mainWin && !mainWin.isDestroyed()) {
          dialog.showMessageBox(mainWin, { type: 'error', title: 'Script Error', message: 'Script failed to start', detail: msg });
        }
        runningProc = null;
        reject(err);
      });

      runningProc.on('close', (code, signal) => {
        const stdout = Buffer.concat(outChunks).toString('utf8');
        const stderr = Buffer.concat(errChunks).toString('utf8');
        runningProc = null;

        if (code === 0) {
          resolve(stdout);
        } else {
          const msg = `il2cpp exited with code=${code}${signal ? ` signal=${signal}` : ''}\n${stderr || stdout}`;
          if (mainWin && !mainWin.isDestroyed()) {
            dialog.showMessageBox(mainWin, {
              type: 'error',
              title: 'Build Failed',
              message: 'IL2CPP compilation failed',
              detail: msg
            });
          }
          reject(new Error(msg));
        }
      });
    } catch (e) {
      runningProc = null;
      reject(e);
    }
  });
});

// ---- app lifecycle ----

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWin) {
      if (mainWin.isMinimized()) mainWin.restore();
      mainWin.focus();
    }
  });

  app.whenReady().then(createWindow);
}

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on('window-all-closed', () => {
  // on mac you’d usually stay alive; you’re quitting anyway, so:
  if (runningProc) {
    try { runningProc.kill('SIGTERM'); } catch { } // best effort
  }
  app.quit();
});
