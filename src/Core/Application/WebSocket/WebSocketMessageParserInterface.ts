import { WebSocketMessageData } from '@/Core/Application/WebSocket/WebSocketMessageData'

export interface WebSocketMessageParserInterface {
  parseMessage(message: WebSocketMessageData): object
}
