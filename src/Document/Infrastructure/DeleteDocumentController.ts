import { Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { CommandBusInterface } from '@/Core/Application/Command/CommandBusInterface'
import { ControllerInterface } from '@/Core/Application/Controller/ControllerInterface'
import { AuthenticatedHttpRequestInterface } from '@/Core/Application/Http/AuthenticatedHttpRequestInterface'
import { Assertion } from '@/Core/Domain/Assert/Assertion'
import { ErrorResponse } from '@/Core/Infrastructure/ErrorResponse'
import { DeleteDocument } from '@/Document/Application/DeleteDocument'
import { DocumentsRepositoryInterface } from '@/Document/Application/DocumentsRepositoryInterface'
import { DocumentId } from '@/Document/Domain/DocumentId'
import { DocumentNotFoundException } from '@/Document/Domain/DocumentNotFoundException'

export class DeleteDocumentController
  implements ControllerInterface<AuthenticatedHttpRequestInterface>
{
  constructor(
    private readonly commandBus: CommandBusInterface,
    private readonly documentsRepository: DocumentsRepositoryInterface,
  ) {}

  async handle(
    request: AuthenticatedHttpRequestInterface,
    response: Response,
  ): Promise<void> {
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
      const accessCheck = await this.documentsRepository.canUserAccessDocument(
        request.locals.authenticatedUser.getUserId(),
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
