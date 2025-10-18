import { NotificationMessageInterface } from '@/Core/Application/NotificationMessageInterface'
import { UserId } from '@/Core/Domain/UserId'

export interface NotificationServiceInterface {
  notifyUser(userId: UserId, message: NotificationMessageInterface): void
}
