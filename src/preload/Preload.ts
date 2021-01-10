import { contextBridge, ipcRenderer } from 'electron';

let webContentsId = 0;
ipcRenderer.invoke('get-webcontents-id')
    .then((id: number) => webContentsId = id)
    .catch(console.error);

contextBridge.exposeInMainWorld('api', {
    dataRecieved: (data: [string, ...any]): void => ipcRenderer.sendTo(webContentsId, 'data-recieved', [data]),
    dataSent: (data: [string, ...any], lastBytes: [number, number]): void => ipcRenderer.sendTo(webContentsId, 'data-sent', [data, lastBytes])
});
