import { NotificationServiceInterface } from '@/Core/Application/NotificationServiceInterface'

export class MockNotificationService implements NotificationServiceInterface {
  public notifyUser = jest.fn()
}
