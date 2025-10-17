import { injectable } from 'inversify'
import { CommandHandlerInterface } from '@/Core/Application/Command/CommandHandlerInterface'
import { DeleteDocument } from '@/Document/Application/DeleteDocument'
import { DocumentService } from '@/Document/Application/DocumentService'

@injectable()
export class DeleteDocumentCommandHandler
  implements CommandHandlerInterface<void>
{
  constructor(private readonly documentService: DocumentService) {}

  public async handle(command: DeleteDocument): Promise<void> {
    await this.documentService.deleteDocument(command.getDocumentId())
  }
}
