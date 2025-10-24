import { ConnectionState } from '@/Core/Application/WebSocket/ConnectionState'
import { WebSocketMessageData } from '@/Core/Application/WebSocket/WebSocketMessageData'

export interface ClientConnectionInterface {
  send(message: string): void
  close(): void
  ping(): void
  readonly readyState: ConnectionState
  on(event: 'message', listener: (data: WebSocketMessageData) => void): void
  on(event: 'close', listener: () => void): void
}
