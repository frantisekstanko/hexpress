import { NotificationServiceInterface } from '@/Core/Application/NotificationServiceInterface'
import { DocumentWasCreated } from '@/Document/Domain/DocumentWasCreated'

export class DocumentWasCreatedListener {
  constructor(
    private readonly notificationService: NotificationServiceInterface,
  ) {}

  public whenDocumentWasCreated(event: DocumentWasCreated): void {
    this.notificationService.notifyUser(event.ownerId, {
      type: 'DocumentWasCreated',
      data: {
        documentId: event.documentId.toString(),
        documentName: event.documentName,
      },
    })
  }
}
