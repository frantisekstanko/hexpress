import { Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import { AuthenticatedRequest } from '@/Authentication/Infrastructure/AuthenticatedRequest'
import { DeleteDocument } from '@/Document/Application/DeleteDocument'
import { DocumentAccessRepositoryInterface } from '@/Document/Application/DocumentAccessRepositoryInterface'
import { DocumentId } from '@/Document/Domain/DocumentId'
import { DocumentNotFoundException } from '@/Document/Domain/DocumentNotFoundException'
import { CommandBusInterface } from '@/Shared/Application/Command/CommandBusInterface'
import { ControllerInterface } from '@/Shared/Application/Controller/ControllerInterface'
import { Symbols } from '@/Shared/Application/Symbols'
import { Assertion } from '@/Shared/Domain/Assert/Assertion'
import { ErrorResponse } from '@/Shared/Infrastructure/ErrorResponse'

@injectable()
export class DeleteDocumentController implements ControllerInterface {
  constructor(
    @inject(Symbols.CommandBusInterface)
    private readonly commandBus: CommandBusInterface,
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

      await this.commandBus.dispatch(new DeleteDocument({ documentId }))

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
