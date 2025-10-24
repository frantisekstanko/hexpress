import { IncomingMessage } from 'node:http'
import WebSocket from 'ws'

export interface ConnectionManagerInterface {
  handleConnection(websocket: WebSocket, request: IncomingMessage): void
}
