import { Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { CommandBusInterface } from '@/Core/Application/Command/CommandBusInterface'
import { ControllerInterface } from '@/Core/Application/Controller/ControllerInterface'
import { AuthenticatedHttpRequest } from '@/Core/Application/Http/AuthenticatedHttpRequest'
import { Assertion } from '@/Core/Domain/Assert/Assertion'
import { ErrorResponse } from '@/Core/Infrastructure/ErrorResponse'
import { CreateDocument } from '@/Document/Application/CreateDocument'
import { DocumentId } from '@/Document/Domain/DocumentId'
import { DocumentName } from '@/Document/Domain/DocumentName'
import { InvalidDocumentNameException } from '@/Document/Domain/InvalidDocumentNameException'

export class CreateDocumentController
  implements ControllerInterface<AuthenticatedHttpRequest>
{
  constructor(private readonly commandBus: CommandBusInterface) {}

  async handle(
    request: AuthenticatedHttpRequest,
    response: Response,
  ): Promise<void> {
    try {
      Assertion.object(request.body, 'Request body is required')
      Assertion.string(
        request.body.documentName,
        'documentName (string) is required',
      )
    } catch (error) {
      response
        .status(StatusCodes.BAD_REQUEST)
        .json(new ErrorResponse({ error: (error as Error).message }).toJSON())
      return
    }

    let documentName: DocumentName
    try {
      documentName = DocumentName.fromString(request.body.documentName)
    } catch (error) {
      if (error instanceof InvalidDocumentNameException) {
        response
          .status(StatusCodes.BAD_REQUEST)
          .json(new ErrorResponse({ error: error.message }).toJSON())
        return
      }
      throw error
    }

    const newDocumentId = await this.commandBus.dispatch<DocumentId>(
      new CreateDocument({
        documentName,
        owner: request.locals.authenticatedUser.getUserId(),
      }),
    )

    response
      .status(StatusCodes.CREATED)
      .json({ documentId: newDocumentId.toString() })
  }
}
