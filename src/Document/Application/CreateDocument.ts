import { CommandInterface } from '@/Core/Application/Command/CommandInterface'
import { UserId } from '@/Core/Domain/UserId'
import { DocumentName } from '@/Document/Domain/DocumentName'

export class CreateDocument implements CommandInterface {
  private readonly documentName: DocumentName
  private readonly owner: UserId

  constructor(args: { documentName: DocumentName; owner: UserId }) {
    this.documentName = args.documentName
    this.owner = args.owner
  }

  public getDocumentName(): DocumentName {
    return this.documentName
  }

  public getOwner(): UserId {
    return this.owner
  }
}
