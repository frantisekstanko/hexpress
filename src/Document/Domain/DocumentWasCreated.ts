import { EventInterface } from '@/Core/Domain/Event/EventInterface'
import { EventLevel } from '@/Core/Domain/Event/EventLevel'
import { EventType } from '@/Core/Domain/Event/EventType'
import { UserId } from '@/Core/Domain/UserId'
import { DocumentId } from '@/Document/Domain/DocumentId'

export class DocumentWasCreated implements EventInterface {
  public readonly documentId: DocumentId
  public readonly documentName: string
  public readonly ownerId: UserId

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
