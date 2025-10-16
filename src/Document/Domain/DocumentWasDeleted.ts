import { EventInterface } from '@/Core/Domain/Event/EventInterface'
import { EventLevel } from '@/Core/Domain/Event/EventLevel'
import { EventType } from '@/Core/Domain/Event/EventType'
import { DocumentId } from '@/Document/Domain/DocumentId'

export class DocumentWasDeleted implements EventInterface {
  private readonly documentId: DocumentId

  constructor(args: { documentId: DocumentId }) {
    this.documentId = args.documentId
  }

  public getEventName(): string {
    return 'DocumentWasDeleted'
  }

  public getLevel(): EventLevel {
    return EventLevel.INFO
  }

  public getLogMessage(): string {
    return `Document ${this.documentId.toString()} was deleted`
  }

  public getLogContext(): Record<string, string | number> {
    return {
      documentId: this.documentId.toString(),
    }
  }

  public getEventType(): EventType {
    return EventType.MANUAL
  }

  public getDocumentId(): DocumentId {
    return this.documentId
  }
}
