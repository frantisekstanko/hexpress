import { DocumentId } from '@/Document/Domain/DocumentId'
import { EventInterface } from '@/Shared/Domain/Event/EventInterface'
import { EventLevel } from '@/Shared/Domain/Event/EventLevel'
import { EventType } from '@/Shared/Domain/Event/EventType'
import { UserId } from '@/Shared/Domain/UserId'

export class DocumentWasCreated implements EventInterface {
  private readonly documentId: DocumentId
  private readonly documentName: string
  private readonly ownerId: UserId

  constructor(args: {
    documentId: DocumentId
    documentName: string
    ownerId: UserId
  }) {
    this.documentId = args.documentId
    this.documentName = args.documentName
    this.ownerId = args.ownerId
  }

  public getEventName(): string {
    return 'DocumentWasCreated'
  }

  public getLevel(): EventLevel {
    return EventLevel.INFO
  }

  public getLogMessage(): string {
    return `Document ${this.documentId.toString()} was created`
  }

  public getLogContext(): Record<string, string | number> {
    return {
      documentId: this.documentId.toString(),
      documentName: this.documentName,
      ownerId: this.ownerId.toString(),
    }
  }

  public getEventType(): EventType {
    return EventType.MANUAL
  }

  public getDocumentId(): DocumentId {
    return this.documentId
  }

  public getDocumentName(): string {
    return this.documentName
  }

  public getOwnerId(): UserId {
    return this.ownerId
  }
}
