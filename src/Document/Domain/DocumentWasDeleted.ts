import { EventInterface } from '@/Core/Domain/Event/EventInterface'
import { EventLevel } from '@/Core/Domain/Event/EventLevel'
import { EventType } from '@/Core/Domain/Event/EventType'
import { UserId } from '@/Core/Domain/UserId'
import { DocumentId } from '@/Document/Domain/DocumentId'

export class DocumentWasDeleted implements EventInterface {
  public readonly documentId: DocumentId
  public readonly ownerId: UserId

  constructor(args: { documentId: DocumentId; ownerId: UserId }) {
    this.documentId = args.documentId
    this.ownerId = args.ownerId
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
      ownerId: this.ownerId.toString(),
    }
  }

  public getEventType(): EventType {
    return EventType.MANUAL
  }

  public getDocumentId(): DocumentId {
    return this.documentId
  }
}
