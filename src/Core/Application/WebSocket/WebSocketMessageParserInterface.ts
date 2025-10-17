import WebSocket from 'ws'

export interface WebSocketMessageParserInterface {
  parseMessage(message: WebSocket.RawData): object
}
