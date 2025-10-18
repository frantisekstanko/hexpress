import { injectable } from 'inversify'
import WebSocket from 'ws'
import { WebSocketMessageParserInterface } from '@/Core/Application/WebSocket/WebSocketMessageParserInterface'

@injectable()
export class WebSocketMessageParser implements WebSocketMessageParserInterface {
  public parseMessage(message: WebSocket.RawData): object {
    const messageString = this.webSocketMessageToString(message)

    return JSON.parse(messageString) as object
  }

  private webSocketMessageToString(message: WebSocket.RawData): string {
    if (Buffer.isBuffer(message)) {
      return message.toString('utf8')
    }

    if (message instanceof ArrayBuffer) {
      return new TextDecoder().decode(message)
    }

    return message.toString()
  }
}
