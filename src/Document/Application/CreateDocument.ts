import { CommandInterface } from '@/Core/Application/Command/CommandInterface'
import { UserId } from '@/Core/Domain/UserId'

export class CreateDocument implements CommandInterface {
  private readonly documentName: string
  private readonly owner: UserId

  constructor(args: { documentName: string; owner: UserId }) {
    this.documentName = args.documentName
    this.owner = args.owner
  }

  public getDocumentName(): string {
    return this.documentName
  }

  public getOwner(): UserId {
    return this.owner
  }
}
