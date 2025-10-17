import { inject, injectable } from 'inversify'
import { Symbols } from '@/Core/Application/Symbols'
import { WebSocketServerInterface } from '@/Core/Application/WebSocketServerInterface'
import { DocumentWasCreated } from '@/Document/Domain/DocumentWasCreated'

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
