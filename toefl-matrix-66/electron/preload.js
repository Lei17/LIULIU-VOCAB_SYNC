const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // User data persistence
  loadUserData: () => ipcRenderer.invoke('load-user-data'),
  saveUserData: (data) => ipcRenderer.invoke('save-user-data', data),
  // Word list management
  importWordList: () => ipcRenderer.invoke('import-wordlist'),
  getWordLists: () => ipcRenderer.invoke('get-wordlists'),
  loadWordList: (id) => ipcRenderer.invoke('load-wordlist', id),
  deleteWordList: (id) => ipcRenderer.invoke('delete-wordlist', id),
});
