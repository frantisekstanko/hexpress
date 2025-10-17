import { inject, injectable } from 'inversify'
import { Symbols } from '@/Core/Application/Symbols'
import { WebSocketServerInterface } from '@/Core/Application/WebSocketServerInterface'
import { DocumentWasDeleted } from '@/Document/Domain/DocumentWasDeleted'

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
