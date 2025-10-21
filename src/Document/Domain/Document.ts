import { EventRecording } from '@/Core/Domain/Event/EventRecording'
import { UserId } from '@/Core/Domain/UserId'
import { DocumentId } from '@/Document/Domain/DocumentId'
import { DocumentName } from '@/Document/Domain/DocumentName'
import { DocumentWasCreated } from '@/Document/Domain/DocumentWasCreated'
import { DocumentWasDeleted } from '@/Document/Domain/DocumentWasDeleted'

export class Document extends EventRecording {
  private id: DocumentId
  private name: DocumentName
  private owner: UserId
  private deleted: boolean

  private constructor(args: {
    id: DocumentId
    name: DocumentName
    owner: UserId
    deleted: boolean
  }) {
    super()
    this.id = args.id
    this.name = args.name
    this.owner = args.owner
    this.deleted = args.deleted
  }

  public static create({
    id,
    name,
    owner,
  }: {
    id: DocumentId
    name: DocumentName
    owner: UserId
  }): Document {
    const document = new Document({ id, name, owner, deleted: false })
    document.recordEvent(
      new DocumentWasCreated({
        documentId: id,
        documentName: name.toString(),
        ownerId: owner,
      }),
    )
    return document
  }

  public static fromPersistence({
    documentId,
    documentName,
    ownedByUserId,
  }: {
    documentId: string
    documentName: string
    ownedByUserId: string
  }): Document {
    return new Document({
      id: DocumentId.fromString(documentId),
      name: DocumentName.fromString(documentName),
      owner: UserId.fromString(ownedByUserId),
      deleted: false,
    })
  }

  public getId(): DocumentId {
    return this.id
  }

  public getName(): DocumentName {
    return this.name
  }

  public getOwner(): UserId {
    return this.owner
  }

  public isDeleted(): boolean {
    return this.deleted
  }

  public delete(): void {
    this.deleted = true
    this.recordEvent(
      new DocumentWasDeleted({ documentId: this.id, ownerId: this.owner }),
    )
  }
}
