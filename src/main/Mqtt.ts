import { ipcMain, WebContents } from 'electron'
import mqtt, { MqttClient } from 'mqtt'

const TIMEOUT = 3 * 1000

type ConnectionOptions = any
type Payload = any
type Header = {
  project: string
  gateName: string
  groupName: string
  mac: string
  messageType: string
}
export type Message = {
  header: Header
  payload: Payload
}
type Subscription = (message: Message) => void
type FetchHeader = Omit<Header, 'project' | 'messageType'>
type RequestMap = Map<string, { resolve: (payload: any) => void; reject: (err: Error) => void }>

export default class Mqtt {
  client: MqttClient | undefined
  webContent: WebContents
  projectName = 'default'
  requests: RequestMap = new Map()
  messageSubscription: undefined | Subscription

  constructor(webContent: WebContents) {
    this.webContent = webContent
    ipcMain.handle('mqttConnect', (_event, params: ConnectionOptions) => this.connect(params))
    ipcMain.handle('mqttDisconnect', () => this.disconnect())
  }

  async connect(opts: ConnectionOptions) {
    if (this.client?.connected) {
      this.client.end()
    }
    const client = mqtt.connect({
      host: opts.host ?? '188.225.81.229',
      port: opts.port ?? 1883,
      username: opts.username ?? '',
      password: opts.password ?? '',
      // username: opts.username ?? 'd2group',
      // password: opts.password ?? 'Opossum2',
      clientId: opts.clientId
    })

    this.client = client
    this.projectName = opts.projectName ?? this.projectName

    this.setHandlers()

    return new Promise<void>((resolve, reject) => {
      client.once('connect', () => {
        resolve()
      })
      client.once('error', (err) => {
        reject(err)
      })
    })
  }

  async disconnect() {
    if (this.client?.connected) {
      this.client.end()
    }
    return new Promise<void>((resolve) => {
      this.client?.once('close', () => {
        resolve()
      })
    })
  }

  async fetch(header: FetchHeader, payload: any): Promise<Payload> {
    const client = this.client
    if (!client) {
      throw new Error('Fetching closed MQTT client')
    }
    const requestId = [this.projectName, header.gateName, header.groupName, header.mac].join('/')
    const topic = `${requestId}/config`
    const promise = this.requests.get(requestId)
    if (promise) {
      promise.reject(
        new Error(`Request for topic "${topic}" repeated. Payload: ${JSON.stringify(payload)}`)
      )
    }

    client.publish(topic, JSON.stringify(payload))

    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        this.requests.get(requestId)?.reject(new Error('Request timeout'))
      }, TIMEOUT)
      this.requests.set(requestId, {
        resolve: (payload: Payload) => {
          this.requests.delete(requestId)
          resolve(payload)
        },
        reject: (err: Error) => {
          this.requests.delete(requestId)
          reject(err)
        }
      })
    })
  }

  async send(topic: string, payload: any) {
    const client = this.client
    if (!client) {
      throw new Error('Sending to closed MQTT client')
    }

    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        reject(new Error('Request timeout'))
      }, TIMEOUT)

      client.publish(topic, JSON.stringify(payload), (err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }

  parseTopic(topic: string): Header {
    const sub = topic.split('/')
    // if (sub.length !== 5) {
    //   throw new Error(`Trying to parse wrong topic: ${topic}`)
    // }
    return {
      project: sub[0],
      gateName: sub[1],
      groupName: sub[2],
      mac: sub[3],
      messageType: sub[sub.length - 1]
    }
  }

  setHandlers() {
    const client = this.client
    if (!client) {
      throw new Error('Handling not existing MQTT client')
    }

    client.subscribe(`${this.projectName}/#`)

    client.on('message', (topic, payload) => {
      this.webContent.send('mqttMessage', topic, payload.toString())

      try {
        const message: Message = {
          header: this.parseTopic(topic),
          payload: JSON.parse(payload.toString())
        }

        // if (message.header.messageType === 'act_value' && this.messageSubscription) {
        if (this.messageSubscription) {
          this.messageSubscription(message)
          // this.fetch(message.header, { ttt: 123 })
          //   .then((response) => {
          //     console.log(response)
          //   })
          //   .catch((err) => console.log(err))
        }
        if (message.header.messageType === 'response') {
          const header = message.header
          const requestId = [header.project, header.gateName, header.groupName, header.mac].join(
            '/'
          )
          const promise = this.requests.get(requestId)
          if (promise) {
            promise.resolve(message.payload)
          }
        }
      } catch (err) {
        this.webContent.send(
          'backError',
          `MQTT message parsing error: ${err} (${topic}:${payload.toString()})`
        )
      }
    })
  }

  subscribe(handler: Subscription) {
    this.messageSubscription = handler
  }
}
