import { Container as InversifyContainer } from 'inversify'
import { CommandHandlerRegistryInterface } from '@/Core/Application/Command/CommandHandlerRegistryInterface'
import { Symbols as CoreSymbols } from '@/Core/Application/Symbols'
import { CreateDocument } from '@/Document/Application/CreateDocument'
import { CreateDocumentCommandHandler } from '@/Document/Application/CreateDocumentCommandHandler'
import { DeleteDocument } from '@/Document/Application/DeleteDocument'
import { DeleteDocumentCommandHandler } from '@/Document/Application/DeleteDocumentCommandHandler'

export class CommandHandlerRegistry {
  static register(container: InversifyContainer): void {
    const commandHandlerRegistry =
      container.get<CommandHandlerRegistryInterface>(
        CoreSymbols.CommandHandlerRegistryInterface,
      )

    const createDocumentCommandHandler =
      container.get<CreateDocumentCommandHandler>(CreateDocumentCommandHandler)

    const deleteDocumentCommandHandler =
      container.get<DeleteDocumentCommandHandler>(DeleteDocumentCommandHandler)

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
