import { UserId } from '@/Core/Domain/UserId'

export interface WebSocketServerInterface {
  broadcastToUser(userId: UserId, message: string): void
  initialize(): void
  shutdown(): Promise<void>
}
