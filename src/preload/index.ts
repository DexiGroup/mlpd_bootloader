import { contextBridge, ipcRenderer } from 'electron'
import IPCSubscribe, { IpcSubscribeHandler } from './ipcSubscribe'
import crc16 from 'crc/crc16'

// const data = [0, 1]
// console.log(data.map((a) => a.toString(16).padStart(2, '0')).join(' '))
// console.log(crc16(new Int8Array(data)))

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
