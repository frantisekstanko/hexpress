export interface WebSocketServerInterface {
  broadcast(message: string): void
  initialize(): void
  shutdown(): Promise<void>
}
