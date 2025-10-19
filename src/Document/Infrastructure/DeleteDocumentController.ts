import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { inject, injectable } from 'inversify'
import { AuthenticatedRequest } from '@/Authentication/Infrastructure/AuthenticatedRequest'
import { CommandBusInterface } from '@/Core/Application/Command/CommandBusInterface'
import { ControllerInterface } from '@/Core/Application/Controller/ControllerInterface'
import { Services as CoreServices } from '@/Core/Application/Services'
import { Assertion } from '@/Core/Domain/Assert/Assertion'
import { ErrorResponse } from '@/Core/Infrastructure/ErrorResponse'
import { DeleteDocument } from '@/Document/Application/DeleteDocument'
import { DocumentAccessRepositoryInterface } from '@/Document/Application/DocumentAccessRepositoryInterface'
import { Services } from '@/Document/Application/Services'
import { DocumentId } from '@/Document/Domain/DocumentId'
import { DocumentNotFoundException } from '@/Document/Domain/DocumentNotFoundException'

@injectable()
export class DeleteDocumentController implements ControllerInterface {
  constructor(
    @inject(CoreServices.CommandBusInterface)
    private readonly commandBus: CommandBusInterface,
    @inject(Services.DocumentAccessRepositoryInterface)
    private readonly documentAccessRepository: DocumentAccessRepositoryInterface,
  ) {}

  async handle(request: Request, response: Response): Promise<void> {
    const authenticatedUser = (request as AuthenticatedRequest).locals
      .authenticatedUser

    let documentId: DocumentId

    try {
      const documentIdAsString = request.params.id

      Assertion.string(
        documentIdAsString,
        'Document ID must be provided in the path',
      )

      documentId = DocumentId.fromString(documentIdAsString)
    } catch {
      response.sendStatus(StatusCodes.BAD_REQUEST)
      return
    }

    try {
      const accessCheck =
        await this.documentAccessRepository.canUserAccessDocument(
          authenticatedUser.getUserId(),
          documentId,
        )

      if (!accessCheck) {
        response.sendStatus(StatusCodes.FORBIDDEN)
        return
      }

      await this.commandBus.dispatch(new DeleteDocument({ documentId }))

      response.sendStatus(StatusCodes.NO_CONTENT)
      return
    } catch (error) {
      if (error instanceof DocumentNotFoundException) {
        response
          .status(StatusCodes.NOT_FOUND)
          .json(new ErrorResponse({ error: 'Document not found' }).toJSON())
        return
      }

      throw error
    }
  }
}
