import Mqtt, { Message } from './Mqtt'
import { ipcMain, WebContents } from 'electron'

type DeviceDescription = any
type Mac = string
type DeviceMap = Map<Mac, DeviceDescription>

export default class Devices {
  webContent: WebContents
  mqtt: Mqtt
  deviceMap: DeviceMap = new Map()

  constructor(webContent: WebContents, mqtt: Mqtt) {
    this.webContent = webContent
    this.mqtt = mqtt

    mqtt.subscribe((payload) => this.update(payload))
    ipcMain.handle('deviceDelete', (_event, mac: string) => this.delete(mac))
    ipcMain.handle('deviceDimmer', (_event, mac: string, value: number) => this.dimmer(mac, value))
  }

  delete(mac: Mac) {
    this.deviceMap.delete(mac)
    this.onUpdate()
  }

  async dimmer(mac: Mac, value: number) {
    const description = this.deviceMap.get(mac)
    const header = {
      mac,
      project: description.project,
      gateName: description.gateName,
      groupName: description.groupName
    }
    const payload = { LightPower: value }
    await this.mqtt.fetch(header, payload)
  }

  onUpdate() {
    this.webContent.send('listUpdate', this.deviceMap)
  }

  update(message: Message) {
    // console.log(message)
    const { mac } = message.header
    const prev = this.deviceMap.get(mac)
    this.deviceMap.set(mac, {
      ...prev,
      ...message.payload,
      timestamp: new Date(),
      ...message.header
    })
    this.onUpdate()
  }
}
