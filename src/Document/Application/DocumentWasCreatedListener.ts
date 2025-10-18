import { inject, injectable } from 'inversify'
import { NotificationServiceInterface } from '@/Core/Application/NotificationServiceInterface'
import { Symbols } from '@/Core/Application/Symbols'
import { DocumentWasCreated } from '@/Document/Domain/DocumentWasCreated'

@injectable()
export class DocumentWasCreatedListener {
  constructor(
    @inject(Symbols.NotificationServiceInterface)
    private readonly notificationService: NotificationServiceInterface,
  ) {}

  public whenDocumentWasCreated(event: DocumentWasCreated): void {
    void event
    this.notificationService.notifyClients('update')
  }
}
