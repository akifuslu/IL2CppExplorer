// preload.js
const { contextBridge, ipcRenderer } = require('electron');
const path = require('path');

contextBridge.exposeInMainWorld('api', {
  // dialogs
  selectUnityDirectory: () => ipcRenderer.invoke('select-unity-dir'),

  // fs
  saveFile: (filePath, content) => ipcRenderer.invoke('save-file', { filePath, content }),
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),

  // process
  runScript: (args = [], env = {}, cwd) => ipcRenderer.invoke('run-script', { args, env, cwd }),

  // small helpers
  dirname: (p) => path.dirname(p),

  // streaming logs
  onProcStdout: (cb) => {
    const handler = (_evt, data) => cb(data);
    ipcRenderer.on('proc:stdout', handler);
    return () => ipcRenderer.off('proc:stdout', handler);
  },
  onProcStderr: (cb) => {
    const handler = (_evt, data) => cb(data);
    ipcRenderer.on('proc:stderr', handler);
    return () => ipcRenderer.off('proc:stderr', handler);
  }
});
