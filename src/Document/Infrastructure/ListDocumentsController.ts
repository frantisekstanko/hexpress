import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { inject, injectable } from 'inversify'
import { AuthenticatedRequest } from '@/Authentication/Infrastructure/AuthenticatedRequest'
import { ControllerInterface } from '@/Core/Application/Controller/ControllerInterface'
import { DocumentsRepositoryInterface } from '@/Document/Application/DocumentsRepositoryInterface'
import { Symbols } from '@/Document/Application/Symbols'

@injectable()
export class ListDocumentsController implements ControllerInterface {
  constructor(
    @inject(Symbols.DocumentsRepositoryInterface)
    private readonly documentsRepository: DocumentsRepositoryInterface,
  ) {}

  async handle(request: Request, response: Response): Promise<void> {
    const authenticatedUser = (request as AuthenticatedRequest).locals
      .authenticatedUser

    const documents = await this.documentsRepository.getDocumentsByUserId(
      authenticatedUser.getUserId(),
    )

    response.status(StatusCodes.OK).json({
      documents: documents.map((document) => ({
        id: document.getDocumentId(),
        name: document.getDocumentName(),
      })),
    })
  }
}
