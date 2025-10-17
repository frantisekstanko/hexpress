import { Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import { AuthenticatedRequest } from '@/Authentication/Infrastructure/AuthenticatedRequest'
import { CommandBusInterface } from '@/Core/Application/Command/CommandBusInterface'
import { ControllerInterface } from '@/Core/Application/Controller/ControllerInterface'
import { Symbols } from '@/Core/Application/Symbols'
import { Assertion } from '@/Core/Domain/Assert/Assertion'
import { ErrorResponse } from '@/Core/Infrastructure/ErrorResponse'
import { CreateDocument } from '@/Document/Application/CreateDocument'
import { DocumentId } from '@/Document/Domain/DocumentId'

@injectable()
export class CreateDocumentController implements ControllerInterface {
  constructor(
    @inject(Symbols.CommandBusInterface)
    private readonly commandBus: CommandBusInterface,
  ) {}

  async handle(request: Request, response: Response): Promise<void> {
    const loggedInUser = (
      request as AuthenticatedRequest
    ).locals.loggedInUserRepository.getLoggedInUser()

    try {
      Assertion.object(request.body, 'Request body is required')
      Assertion.string(
        request.body.documentName,
        'documentName (string) is required',
      )
    } catch (error) {
      response
        .status(400)
        .json(new ErrorResponse({ error: (error as Error).message }).toJSON())
      return
    }

    const documentName = request.body.documentName

    if (documentName.length === 0) {
      response.status(400).json(
        new ErrorResponse({
          error: 'documentName must not be empty',
        }).toJSON(),
      )
      return
    }

    const newDocumentId = await this.commandBus.dispatch<DocumentId>(
      new CreateDocument({
        documentName,
        owner: loggedInUser.getUserId(),
      }),
    )

    response.status(201).json({ documentId: newDocumentId.toString() })
  }
}
