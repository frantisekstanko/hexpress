import { Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import { AuthenticatedRequest } from '@/Authentication/Infrastructure/AuthenticatedRequest'
import { DocumentsRepositoryInterface } from '@/Document/Application/DocumentsRepositoryInterface'
import { ControllerInterface } from '@/Shared/Application/Controller/ControllerInterface'
import { Symbols } from '@/Shared/Application/Symbols'

@injectable()
export class ListDocumentsController implements ControllerInterface {
  constructor(
    @inject(Symbols.DocumentsRepositoryInterface)
    private readonly documentsRepository: DocumentsRepositoryInterface,
  ) {}

  async handle(request: Request, response: Response): Promise<void> {
    const loggedInUser = (
      request as AuthenticatedRequest
    ).locals.loggedInUserRepository.getLoggedInUser()

    const documents = await this.documentsRepository.getDocumentsByUserId(
      loggedInUser.getUserId(),
    )

    response.status(200).json({
      documents: documents.map((document) => ({
        id: document.getDocumentId(),
        name: document.getDocumentName(),
      })),
    })
  }
}
