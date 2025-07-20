const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  selectUnityDirectory: () => ipcRenderer.invoke('select-unity-dir'),
  runScript: (args, env) => ipcRenderer.invoke('run-script', { args, env })
});
