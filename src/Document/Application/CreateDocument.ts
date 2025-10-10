import { CommandInterface } from '@/Shared/Application/Command/CommandInterface'
import { UserId } from '@/Shared/Domain/UserId'

export class CreateDocument implements CommandInterface {
  private readonly documentName: string
  private readonly owner: UserId

  constructor(args: { documentName: string; owner: UserId }) {
    this.documentName = args.documentName
    this.owner = args.owner
  }

  getDocumentName(): string {
    return this.documentName
  }

  getOwner(): UserId {
    return this.owner
  }
}
