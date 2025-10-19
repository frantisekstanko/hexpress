import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { inject, injectable } from 'inversify'
import { AuthenticatedRequest } from '@/Authentication/Infrastructure/AuthenticatedRequest'
import { CommandBusInterface } from '@/Core/Application/Command/CommandBusInterface'
import { ControllerInterface } from '@/Core/Application/Controller/ControllerInterface'
import { Services } from '@/Core/Application/Services'
import { Assertion } from '@/Core/Domain/Assert/Assertion'
import { ErrorResponse } from '@/Core/Infrastructure/ErrorResponse'
import { CreateDocument } from '@/Document/Application/CreateDocument'
import { DocumentId } from '@/Document/Domain/DocumentId'

@injectable()
export class CreateDocumentController implements ControllerInterface {
  constructor(
    @inject(Services.CommandBusInterface)
    private readonly commandBus: CommandBusInterface,
  ) {}

  async handle(request: Request, response: Response): Promise<void> {
    const authenticatedUser = (request as AuthenticatedRequest).locals
      .authenticatedUser

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
        owner: authenticatedUser.getUserId(),
      }),
    )

    response
      .status(StatusCodes.CREATED)
      .json({ documentId: newDocumentId.toString() })
  }
}
