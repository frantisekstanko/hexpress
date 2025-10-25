import { Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ControllerInterface } from '@/Core/Application/Controller/ControllerInterface'
import { AuthenticatedHttpRequestInterface } from '@/Core/Application/Http/AuthenticatedHttpRequestInterface'
import { DocumentsRepositoryInterface } from '@/Document/Application/DocumentsRepositoryInterface'

export class ListDocumentsController
  implements ControllerInterface<AuthenticatedHttpRequestInterface>
{
  constructor(
    private readonly documentsRepository: DocumentsRepositoryInterface,
  ) {}

  async handle(
    request: AuthenticatedHttpRequestInterface,
    response: Response,
  ): Promise<void> {
    const documents = await this.documentsRepository.getDocumentsByUserId(
      request.locals.authenticatedUser.getUserId(),
    )

    response.status(StatusCodes.OK).json({
      documents: documents.map((document) => ({
        id: document.getDocumentId(),
        name: document.getDocumentName(),
      })),
    })
  }
}
