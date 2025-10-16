import { injectable } from 'inversify'
import { CreateDocument } from '@/Document/Application/CreateDocument'
import { DocumentService } from '@/Document/Application/DocumentService'
import { DocumentId } from '@/Document/Domain/DocumentId'
import { CommandHandlerInterface } from '@/Shared/Application/Command/CommandHandlerInterface'

@injectable()
export class CreateDocumentCommandHandler
  implements CommandHandlerInterface<DocumentId>
{
  constructor(private readonly documentService: DocumentService) {}

  public async handle(command: CreateDocument): Promise<DocumentId> {
    return await this.documentService.createDocument(command)
  }
}
