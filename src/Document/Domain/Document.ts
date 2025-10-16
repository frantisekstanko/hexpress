import { Assertion } from '@/Core/Domain/Assert/Assertion'
import { EventRecording } from '@/Core/Domain/Event/EventRecording'
import { UserId } from '@/Core/Domain/UserId'
import { DocumentId } from '@/Document/Domain/DocumentId'
import { DocumentWasCreated } from '@/Document/Domain/DocumentWasCreated'
import { DocumentWasDeleted } from '@/Document/Domain/DocumentWasDeleted'

export class Document extends EventRecording {
  private id: DocumentId
  private name: string
  private owner: UserId
  private deleted: boolean

  private constructor(args: {
    id: DocumentId
    name: string
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
    name: string
    owner: UserId
  }) {
    const document = new Document({ id, name, owner, deleted: false })
    document.recordEvent(
      new DocumentWasCreated({
        documentId: id,
        documentName: name,
        ownerId: owner,
      }),
    )
    return document
  }

  public static fromStorage(row: unknown): Document {
    Assertion.object(row, 'Row must be an object')
    Assertion.string(row.documentId, 'documentId must be a string')
    Assertion.string(row.documentName, 'documentName must be a string')
    Assertion.string(row.ownedByUserId, 'ownedByUserId must be a string')

    return new Document({
      id: DocumentId.fromString(row.documentId),
      name: row.documentName,
      owner: UserId.fromString(row.ownedByUserId),
      deleted: false,
    })
  }

  public toStorage(): {
    id: string
    name: string
    owner: string
    deleted: boolean
  } {
    return {
      id: this.id.toString(),
      name: this.name,
      owner: this.owner.toString(),
      deleted: this.deleted,
    }
  }

  public delete(): void {
    this.deleted = true
    this.recordEvent(new DocumentWasDeleted({ documentId: this.id }))
  }
}
