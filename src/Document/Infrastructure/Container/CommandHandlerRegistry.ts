import { ContainerInterface } from '@/Core/Application/ContainerInterface'
import { Services } from '@/Core/Application/Services'
import { CreateDocument } from '@/Document/Application/CreateDocument'
import { CreateDocumentCommandHandler } from '@/Document/Application/CreateDocumentCommandHandler'
import { DeleteDocument } from '@/Document/Application/DeleteDocument'
import { DeleteDocumentCommandHandler } from '@/Document/Application/DeleteDocumentCommandHandler'

export class CommandHandlerRegistry {
  static register(container: ContainerInterface): void {
    const commandHandlerRegistry = container.get(
      Services.CommandHandlerRegistryInterface,
    )

    const createDocumentCommandHandler = container.get(
      CreateDocumentCommandHandler,
    )

    const deleteDocumentCommandHandler = container.get(
      DeleteDocumentCommandHandler,
    )

    commandHandlerRegistry.register(
      CreateDocument,
      createDocumentCommandHandler,
    )

    commandHandlerRegistry.register(
      DeleteDocument,
      deleteDocumentCommandHandler,
    )
  }
}
