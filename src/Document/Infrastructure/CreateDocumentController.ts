import { Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { AuthenticatedHttpRequest } from '@/Authentication/Application/AuthenticatedHttpRequest'
import { CommandBusInterface } from '@/Core/Application/Command/CommandBusInterface'
import { ControllerInterface } from '@/Core/Application/Controller/ControllerInterface'
import { Assertion } from '@/Core/Domain/Assert/Assertion'
import { ErrorResponse } from '@/Core/Infrastructure/ErrorResponse'
import { CreateDocument } from '@/Document/Application/CreateDocument'
import { DocumentId } from '@/Document/Domain/DocumentId'

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

    const documentName = request.body.documentName

    if (documentName.length === 0) {
      response.status(StatusCodes.BAD_REQUEST).json(
        new ErrorResponse({
          error: 'documentName must not be empty',
        }).toJSON(),
      )
      return
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
