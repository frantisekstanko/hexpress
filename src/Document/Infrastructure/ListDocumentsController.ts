import { Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import { AuthenticatedRequest } from '@/Authentication/Infrastructure/AuthenticatedRequest'
import { ControllerInterface } from '@/Core/Application/Controller/ControllerInterface'
import { Symbols } from '@/Core/Application/Symbols'
import { DocumentsRepositoryInterface } from '@/Document/Application/DocumentsRepositoryInterface'

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
