import Mqtt, { Message } from './Mqtt'
import { ipcMain, WebContents } from 'electron'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'

type ProgramParams = {
  projectName: string
  gateId: string
  repeatCount: number
  sendInterval: number
}

export default class Bootloader {
  webContent: WebContents
  mqtt: Mqtt
  // file: Buffer | undefined
  data: number[][] | undefined
  params: ProgramParams | undefined
  currentRow = 0
  currentRepeat = 0
  timer: ReturnType<typeof setTimeout> | undefined
  gates = new Set<string>()
  status: string = 'empty'

  constructor(webContent: WebContents, mqtt: Mqtt) {
    this.webContent = webContent
    this.mqtt = mqtt
    ipcMain.handle('abortProgram', (_event) => this.abort())
    ipcMain.handle('beginProgram', (_event, params: ProgramParams) => this.program(params))
    ipcMain.handle('startProgram', (_event) => this.start())
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
    // this.params = params
    this.currentRow = 0
    this.currentRepeat = 0
    this.params = {
      gateId: params.gateId.trim(),
      repeatCount: +params.repeatCount,
      sendInterval: +params.sendInterval,
      projectName: params.projectName.trim()
    }
    this.updateProgress()

    this.setStatus('progress')
    await this.sendRow()
  }

  private async sendRow() {
    if (!this.params) {
      throw new Error('No params provided')
    }
    if (!this.data) {
      throw new Error('No file provided')
    }
    const topic = [this.params.projectName, this.params.gateId, 'all', 'all', 'boot'].join('/')
    const payload = { Data: this.data[this.currentRow] }
    this.currentRepeat++
    if (this.currentRepeat >= this.params.repeatCount) {
      this.currentRow++
      this.currentRepeat = 0
      this.updateProgress()
    }
    try {
      await this.mqtt.send(topic, payload)
      if (this.currentRow < this.data.length) {
        this.timer = setTimeout(() => {
          this.sendRow()
        }, this.params.sendInterval)
      } else {
        this.setStatus('finish')
      }
    } catch (err) {
      this.abort(err as Error)
    }
  }

  private setStatus(status: string) {
    this.status = status
    this.webContent.send('updateStatus', status)
  }

  start() {
    console.log('start')
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
    this.webContent.send('updateProgress', { current: this.currentRow, total: this.data?.length })
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
    const data = rows.map((row) => {
      return row.match(/[0-9a-f]{2}/gi)?.map((str) => parseInt(str, 16))
    })
    const totalLength = data.reduce((acc, curr) => acc + (curr?.length ?? 0), 0)

    if (data.length === 0) {
      throw new Error('Empty file')
    }
    this.data = data as number[][]
    const description = {
      filePath,
      fileName: name,
      fileSize: totalLength,
      rowCount: data.length,
      projectName: this.mqtt.projectName
    }
    this.setStatus('ready')
    this.webContent.send('uploadedFile', description)
  }
}
