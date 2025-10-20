import { WebSocketMessageData } from '@/Core/Application/WebSocket/WebSocketMessageData'
import { WebSocketMessageParserInterface } from '@/Core/Application/WebSocket/WebSocketMessageParserInterface'

export class WebSocketMessageParser implements WebSocketMessageParserInterface {
  public parseMessage(message: WebSocketMessageData): object {
    const messageString = this.webSocketMessageToString(message)

    return JSON.parse(messageString) as object
  }

  private webSocketMessageToString(message: WebSocketMessageData): string {
    if (Buffer.isBuffer(message)) {
      return message.toString('utf8')
    }

    if (message instanceof ArrayBuffer) {
      return new TextDecoder().decode(message)
    }

    return message.toString()
  }
}
