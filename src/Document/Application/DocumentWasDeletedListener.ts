import { inject, injectable } from 'inversify'
import { NotificationServiceInterface } from '@/Core/Application/NotificationServiceInterface'
import { Services } from '@/Core/Application/Services'
import { DocumentWasDeleted } from '@/Document/Domain/DocumentWasDeleted'

@injectable()
export class DocumentWasDeletedListener {
  constructor(
    @inject(Services.NotificationServiceInterface)
    private readonly notificationService: NotificationServiceInterface,
  ) {}

  public whenDocumentWasDeleted(event: DocumentWasDeleted): void {
    this.notificationService.notifyUser(event.ownerId, {
      type: 'DocumentWasDeleted',
      data: {
        documentId: event.documentId.toString(),
      },
    })
  }
}
