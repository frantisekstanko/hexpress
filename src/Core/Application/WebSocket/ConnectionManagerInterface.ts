import { IncomingMessage } from 'node:http'
import { ClientConnectionInterface } from '@/Core/Application/WebSocket/ClientConnectionInterface'

export interface ConnectionManagerInterface {
  handleConnection(
    websocket: ClientConnectionInterface,
    request: IncomingMessage,
  ): void
}
