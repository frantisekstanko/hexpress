import { Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import { DocumentAccessRepositoryInterface } from '@/Document/Application/DocumentAccessRepositoryInterface'
import { DocumentService } from '@/Document/Application/DocumentService'
import { DocumentId } from '@/Document/Domain/DocumentId'
import { DocumentNotFoundException } from '@/Document/Domain/DocumentNotFoundException'
import { ControllerInterface } from '@/Shared/Application/Controller/ControllerInterface'
import { Symbols } from '@/Shared/Application/Symbols'
import { Assertion } from '@/Shared/Domain/Assert/Assertion'
import { AuthenticatedRequest } from '@/Shared/Infrastructure/AuthenticatedRequest'
import { ErrorResponse } from '@/Shared/Infrastructure/ErrorResponse'

@injectable()
export class DeleteDocumentController implements ControllerInterface {
  constructor(
    private readonly documentService: DocumentService,
    @inject(Symbols.DocumentAccessRepositoryInterface)
    private readonly documentAccessRepository: DocumentAccessRepositoryInterface,
  ) {}

  async handle(request: Request, response: Response): Promise<void> {
    const loggedInUser = (
      request as AuthenticatedRequest
    ).locals.loggedInUserRepository.getLoggedInUser()

    let documentId: DocumentId

    try {
      const documentIdAsString = request.params.id

      Assertion.string(
        documentIdAsString,
        'Document ID must be provided in the path',
      )

      documentId = DocumentId.fromString(documentIdAsString)
    } catch {
      response.sendStatus(400)
      return
    }

    try {
      const accessCheck =
        await this.documentAccessRepository.canUserAccessDocument(
          loggedInUser.getUserId(),
          documentId,
        )

      if (!accessCheck) {
        response.sendStatus(403)
        return
      }

      await this.documentService.deleteDocument(documentId)

      response.sendStatus(204)
      return
    } catch (error) {
      if (error instanceof DocumentNotFoundException) {
        response
          .status(404)
          .json(new ErrorResponse({ error: 'Document not found' }).toJSON())
        return
      }

      throw error
    }
  }
}
