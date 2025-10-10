import { inject, injectable } from 'inversify'
import { DocumentWasCreated } from '@/Document/Domain/DocumentWasCreated'
import { Symbols } from '@/Shared/Application/Symbols'
import { WebSocketServerInterface } from '@/Shared/Application/WebSocketServerInterface'

@injectable()
export class DocumentWasCreatedListener {
  constructor(
    @inject(Symbols.WebSocketServerInterface)
    private readonly webSocketServer: WebSocketServerInterface,
  ) {}

  public whenDocumentWasCreated(event: DocumentWasCreated): void {
    void event
    this.webSocketServer.broadcast('update')
  }
}
