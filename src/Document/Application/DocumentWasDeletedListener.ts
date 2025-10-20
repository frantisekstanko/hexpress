import { NotificationServiceInterface } from '@/Core/Application/NotificationServiceInterface'
import { DocumentWasDeleted } from '@/Document/Domain/DocumentWasDeleted'

export class DocumentWasDeletedListener {
  constructor(
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
