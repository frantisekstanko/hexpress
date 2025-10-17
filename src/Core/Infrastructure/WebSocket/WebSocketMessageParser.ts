import { injectable } from 'inversify'
import WebSocket from 'ws'
import { WebSocketMessageParserInterface } from '@/Core/Application/WebSocket/WebSocketMessageParserInterface'

@injectable()
export class WebSocketMessageParser implements WebSocketMessageParserInterface {
  public parseMessage(message: WebSocket.RawData): object {
    let messageString: string
    if (Buffer.isBuffer(message)) {
      messageString = message.toString('utf8')
    } else if (message instanceof ArrayBuffer) {
      messageString = new TextDecoder().decode(message)
    } else {
      messageString = message.toString()
    }

    return JSON.parse(messageString) as object
  }
}
