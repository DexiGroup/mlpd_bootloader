import { contextBridge, ipcRenderer } from 'electron'
import IPCSubscribe, { IpcSubscribeHandler } from './ipcSubscribe'

const ipcSubscribe = new IPCSubscribe()

contextBridge.exposeInMainWorld('mqtt', {
  connect: (params: any) => {
    return ipcRenderer.invoke('mqttConnect', params)
  },
  disconnect: (params: any) => {
    return ipcRenderer.invoke('mqttDisconnect', params)
  }
})

contextBridge.exposeInMainWorld('ipc', {
  subscribe: (channel: string, handler: IpcSubscribeHandler) => {
    return ipcSubscribe.subscribe(channel, handler)
  }
})

contextBridge.exposeInMainWorld('bootloader', {
  abortProgram: () => {
    return ipcRenderer.invoke('abortProgram')
  },
  beginProgram: (params: any) => {
    return ipcRenderer.invoke('beginProgram', params)
  },
  runProgram: () => {
    return ipcRenderer.invoke('runProgram')
  },
  uploadFile: (filePath: string) => {
    return ipcRenderer.invoke('uploadFile', filePath)
  }
})
