import { ElectronAPI } from '@electron-toolkit/preload'
import { IpcSubscribeHandler } from './ipcSubscribe'
// import mqtt, { MqttClient }  from 'mqtt'
// import { IClientOptions } from 'mqtt/src/lib/client'

declare global {
  interface Window {
    mqtt: {
      connect: (params: any) => Promise<void>
      disconnect: () => Promise<void>
    },
    ipc: {
      subscribe: (channel: string, handler:IpcSubscribeHandler) => (() => void)
    },
    bootloader: {
      abortProgram: () => Promise<void>,
      beginProgram: (params: any) => Promise<void>,
      runProgram: () => Promise<void>,
      uploadFile: (filePath:string) => Promise<void>,
    }
  }
}
