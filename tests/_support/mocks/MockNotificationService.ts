import { NotificationServiceInterface } from '@/Core/Application/NotificationServiceInterface'

export class MockNotificationService implements NotificationServiceInterface {
  public notifyClients = jest.fn()
}
