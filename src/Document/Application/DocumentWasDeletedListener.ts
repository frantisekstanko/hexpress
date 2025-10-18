import { inject, injectable } from 'inversify'
import { NotificationServiceInterface } from '@/Core/Application/NotificationServiceInterface'
import { Symbols } from '@/Core/Application/Symbols'
import { DocumentWasDeleted } from '@/Document/Domain/DocumentWasDeleted'

@injectable()
export class DocumentWasDeletedListener {
  constructor(
    @inject(Symbols.NotificationServiceInterface)
    private readonly notificationService: NotificationServiceInterface,
  ) {}

  public whenDocumentWasDeleted(event: DocumentWasDeleted): void {
    void event
    this.notificationService.notifyClients('update')
  }
}
