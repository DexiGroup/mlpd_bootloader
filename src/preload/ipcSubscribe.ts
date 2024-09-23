import { ipcRenderer } from 'electron'

export type IpcSubscribeHandler = (...args: any[]) => void

export default class IPCSubscribe {
  handlerMap = new Map()
  constructor() {
    // this.subscribe('backError', (err: Error) => {
    //   console.log(err)
    // })
    // this.subscribe('mqttMessage', (topic: string, payload:any) => {
    //   console.log(topic, payload)
    // })
  }
  subscribe(channel: string, handler: IpcSubscribeHandler) {
    const resHandler = (_event, ...args) => handler(...args)
    this.handlerMap.set(handler, resHandler)
    ipcRenderer.on(channel, resHandler)
    return () => {
      this.unsubscribe(channel, handler)
    }
  }

  private unsubscribe(channel: string, handler: IpcSubscribeHandler): void {
    const resHandler = this.handlerMap.get(handler)
    ipcRenderer.removeListener(channel, resHandler)
    this.handlerMap.delete(handler)
  }
}
