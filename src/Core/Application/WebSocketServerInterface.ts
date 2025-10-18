import { UserId } from '@/Core/Domain/UserId'

export interface WebSocketServerInterface {
  broadcast(message: string): void
  broadcastToUser(userId: UserId, message: string): void
  initialize(): void
  shutdown(): Promise<void>
}
