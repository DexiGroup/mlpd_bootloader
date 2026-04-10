import Mqtt, { Message } from './Mqtt'
import { ipcMain, WebContents } from 'electron'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import crc16 from 'crc/crc16'

type ProgramParams = {
  projectName: string
  gateId: string
  repeatCount: number
  sendInterval: number
  groupName: string
  deviceName: string
  version: number[]
  verticalSending: boolean
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default class Bootloader {
  webContent: WebContents
  mqtt: Mqtt
  // file: Buffer | undefined
  data: number[][] | undefined
  allData: number[] = []
  params: ProgramParams | undefined
  currentRow = 0
  currentRepeat = 0
  timer: ReturnType<typeof setTimeout> | undefined
  gates = new Set<string>()
  status: string = 'empty'
  currentProgress = 0

  constructor(webContent: WebContents, mqtt: Mqtt) {
    this.webContent = webContent
    this.mqtt = mqtt
    ipcMain.handle('abortProgram', () => this.abort())
    ipcMain.handle('beginProgram', (_event, params: ProgramParams) => this.program(params))
    ipcMain.handle('runProgram', () => this.runProgram())
    ipcMain.handle('uploadFile', (_event, filePath: string) => this.uploadFile(filePath))
    this.mqtt.subscribe((message) => this.updateGateList(message))
  }

  abort(reason?: Error) {
    this.setStatus('abort')
    if (this.timer) {
      clearTimeout(this.timer)
    }
    if (reason) {
      this.webContent.send('backError', reason)
    }

    this.webContent.send('abortedProgram')
  }

  async program(params: any) {
    if (this.status === 'progress') {
      this.abort()
    }
    if (!params.gateId || params.gateId === '') {
      throw new Error(`Gate ID must be specified`)
    }
    this.currentProgress = 0
    // console.log(params)
    // const versionRegExp = /\d{1,3}\.\d{1,3}/
    // if (!params.version || !versionRegExp.test(params.version)) {
    //   throw new Error(`Version must be specified`)
    // }
    // this.params = params
    this.currentRow = 0
    this.currentRepeat = 0
    this.params = {
      gateId: params.gateId.trim(),
      repeatCount: +params.repeatCount,
      sendInterval: +params.sendInterval,
      projectName: params.projectName.trim(),
      groupName: params.groupName?.trim() ?? 'all',
      deviceName: params.deviceName?.trim() ?? 'all',
      version: [1, 1],
      verticalSending: !!params.verticalSending
      // version: params.version.split('.').map((a) => parseInt(a))
    }
    // this.updateProgress()

    this.setStatus('progress')
    await this.sendData()
    // if (this.params.verticalSending) {
    //   await this.sendRowVertical()
    // } else {
    //   await this.sendRowHorizontal()
    // }
  }

  private getTopic() {
    if (!this.params) {
      throw new Error('No params provided')
    }
    return [
      this.mqtt.projectName,
      this.params.gateId,
      this.params.groupName ?? 'all',
      this.params.deviceName ?? 'all',
      'boot'
    ].join('/')
  }

  // private async sendRow() {
  //   if (!this.params) {
  //     throw new Error('No params provided')
  //   }
  //   if (!this.data) {
  //     throw new Error('No file provided')
  //   }
  //   const topic = this.getTopic()
  //
  //   const payload = { Data: this.data[this.currentRow] }
  //   this.currentRepeat++
  //   if (this.currentRepeat >= this.params.repeatCount) {
  //     this.currentRow++
  //     this.currentRepeat = 0
  //     this.updateProgress()
  //   }
  //
  //   try {
  //     await this.mqtt.send(topic, payload)
  //     if (this.currentRow < this.data.length) {
  //       this.timer = setTimeout(() => {
  //         this.sendRow()
  //       }, this.params.sendInterval)
  //     } else {
  //       await sleep(this.params.sendInterval)
  //       for (let i = 0; i < this.params.repeatCount; i += 1) {
  //         await this.runProgram()
  //       }
  //       this.setStatus('finish')
  //       // setTimeout(() => {
  //       //   this.runProgram()
  //       // }, 1500)
  //     }
  //   } catch (err) {
  //     this.abort(err as Error)
  //   }
  // }

  private async sendMessage(topic, payload) {
    await this.mqtt.send(topic, payload)
    await sleep(this.params!.sendInterval)
    this.updateProgress()
  }
  // private async sendRow(topic, payload) {
  //   try {
  //     await this.mqtt.send(topic, payload)
  //     await sleep(this.params!.sendInterval)
  //     this.updateProgress()
  //   } catch (err) {
  //     this.abort(err as Error)
  //     return
  //   }
  // }

  private async sendData() {
    if (!this.params) {
      throw new Error('No params provided')
    }
    if (!this.data) {
      throw new Error('No file provided')
    }
    const topic = this.getTopic()

    try {
      if (this.params.verticalSending) {
        for (let i = 0; i < this.params.repeatCount; i++) {
          for (let j = 0; j < this.data.length; j++) {
            const payload = { Data: this.data[j] }
            await this.sendMessage(topic, payload)
          }
          await this.runProgram()
        }
      } else {
        for (let i = 0; i < this.data.length; i++) {
          const payload = { Data: this.data[i] }
          for (let j = 0; j < this.params.repeatCount; j++) {
            await this.sendMessage(topic, payload)
          }
        }
        for (let j = 0; j < this.params.repeatCount; j++) {
          await this.runProgram()
        }
      }
    } catch (err) {
      this.abort(err as Error)
      return
    }
    this.setStatus('finish')
  }

  // private async sendRowHorizontal() {
  //   if (!this.params) {
  //     throw new Error('No params provided')
  //   }
  //   if (!this.data) {
  //     throw new Error('No file provided')
  //   }
  //   const topic = this.getTopic()
  //   for (let i = 0; i < this.params.repeatCount; i++) {
  //     for (let j = 0; j < this.data.length; j++) {
  //       const payload = { Data: this.data[j] }
  //       try {
  //         await this.mqtt.send(topic, payload)
  //         await sleep(this.params.sendInterval)
  //         this.updateProgress()
  //       } catch (err) {
  //         this.abort(err as Error)
  //         return
  //       }
  //     }
  //     await this.runProgram()
  //   }
  //   this.setStatus('finish')
  // }

  private setStatus(status: string) {
    this.status = status
    this.webContent.send('updateStatus', status)
  }

  async runProgram() {
    if (!this.params) {
      throw new Error('No params provided')
    }
    if (!this.data) {
      throw new Error('No file provided')
    }
    const allData = this.allData
    const crc = crc16(Buffer.from(allData), 0xffff)
    const payload = Buffer.alloc(6)
    const version = this.params.version
    payload.writeUInt16LE(allData.length, 0)
    payload.writeUInt16LE(crc, 2)
    payload.writeUInt8(version[0], 4)
    payload.writeUInt8(version[1], 5)
    const msg = [payload.length, 0x00, 0x00, 0x01, ...Array.from(payload)]
    const sum = 256 - (msg.reduce((acc, cur) => acc + cur) % 256)
    msg.push(sum)

    const topic = this.getTopic()
    await this.sendMessage(topic, { Data: msg })
    // await this.mqtt.send(topic, { Data: msg })
    // await sleep(this.params.sendInterval)
    // this.updateProgress()
  }

  private updateGateList(message: Message) {
    const { gateName } = message.header
    if (!this.gates.has(gateName)) {
      this.gates.add(gateName)
      this.webContent.send('updateGateList', Array.from(this.gates))
    }
    // this.webContent.send('updateProgress', { current: this.currentRow, total: this.data?.length })
  }

  private updateProgress() {
    if (!this.data) {
      throw new Error('No file provided')
    }
    if (!this.params) {
      throw new Error('No params provided')
    }
    this.webContent.send('updateProgress', {
      current: ++this.currentProgress,
      total: (this.data.length + 1) * this.params?.repeatCount
    })
  }

  async uploadFile(filePath: string) {
    const { ext, name } = path.parse(filePath)
    if (ext !== '.hex') {
      throw new Error(`Incorrect file extension: '${ext}'. Must be a '.hex'`)
    }
    const buf = await fs.readFile(filePath)

    let str = buf.toString()
    str = str.replace(/\r\n/g, 't')
    str = str.replace(/\r/g, 't')
    str = str.replace(/\n/g, 't')
    let rows = str.split('t')
    rows = rows.filter((row) => row.length > 0)
    let data = rows
      .map((row) => {
        return row.match(/[0-9a-f]{2}/gi)?.map((str) => parseInt(str, 16))
      })
      .filter((row) => row !== undefined)

    data = data.filter((row) => row[3] === 0)
    data.pop()

    const totalLength = data.reduce((acc, cur) => acc + (cur?.length ?? 0), 0)
    const allData = data.reduce((acc, cur) => {
      acc.push(...cur.slice(4, -1))
      return acc
    }, [])
    this.allData = allData

    if (data.length === 0) {
      throw new Error('Empty file')
    }

    this.data = data as number[][]
    const description = {
      filePath,
      fileName: name,
      fileSize: totalLength,
      rowCount: data.length,
      projectName: this.mqtt.projectName,
      allData,
      crc: crc16(Buffer.from(allData), 0xffff),
      size: allData.length,
      data
    }
    this.setStatus('ready')
    this.webContent.send('uploadedFile', description)
  }
}
