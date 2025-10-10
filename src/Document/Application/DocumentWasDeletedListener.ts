import { inject, injectable } from 'inversify'
import { DocumentWasDeleted } from '@/Document/Domain/DocumentWasDeleted'
import { Symbols } from '@/Shared/Application/Symbols'
import { WebSocketServerInterface } from '@/Shared/Application/WebSocketServerInterface'

@injectable()
export class DocumentWasDeletedListener {
  constructor(
    @inject(Symbols.WebSocketServerInterface)
    private readonly webSocketServer: WebSocketServerInterface,
  ) {}

  public whenDocumentWasDeleted(event: DocumentWasDeleted): void {
    void event
    this.webSocketServer.broadcast('update')
  }
}
