import { NotificationDataInterface } from '@/Core/Application/NotificationDataInterface'

export interface NotificationMessageInterface {
  type: string
  data?: NotificationDataInterface
}
