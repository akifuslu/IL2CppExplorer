const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  selectUnityDirectory: () => ipcRenderer.invoke('select-unity-dir'),
  runScript: (args, env) => ipcRenderer.invoke('run-script', { args, env }),
  saveFile: (filePath, content) => ipcRenderer.invoke('save-file', { filePath, content }),
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
});
