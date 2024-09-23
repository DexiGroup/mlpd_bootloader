import { app } from 'electron'
import createWindow from './createWindow'
import Mqtt from './Mqtt'
// import Devices from './Devices'
import Bootloader from "./Bootloader";

app
  .whenReady()
  .then(createWindow)
  .then((window) => {
    const content = window.webContents

    const mqtt = new Mqtt(content)
    // const devices = new Devices(content, mqtt)
    new Bootloader(content, mqtt)
  })
