import { inject, injectable } from 'inversify'
import { NotificationServiceInterface } from '@/Core/Application/NotificationServiceInterface'
import { Services } from '@/Core/Application/Services'
import { DocumentWasCreated } from '@/Document/Domain/DocumentWasCreated'

@injectable()
export class DocumentWasCreatedListener {
  constructor(
    @inject(Services.NotificationServiceInterface)
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
