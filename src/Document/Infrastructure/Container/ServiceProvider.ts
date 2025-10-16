import { Container as InversifyContainer } from 'inversify'
import { CreateDocument } from '@/Document/Application/CreateDocument'
import { CreateDocumentCommandHandler } from '@/Document/Application/CreateDocumentCommandHandler'
import { DocumentAccessRepositoryInterface } from '@/Document/Application/DocumentAccessRepositoryInterface'
import { DocumentService } from '@/Document/Application/DocumentService'
import { DocumentsRepositoryInterface } from '@/Document/Application/DocumentsRepositoryInterface'
import { DocumentWasCreatedListener } from '@/Document/Application/DocumentWasCreatedListener'
import { DocumentWasDeletedListener } from '@/Document/Application/DocumentWasDeletedListener'
import { DocumentRepositoryInterface } from '@/Document/Domain/DocumentRepositoryInterface'
import { DocumentWasCreated } from '@/Document/Domain/DocumentWasCreated'
import { DocumentWasDeleted } from '@/Document/Domain/DocumentWasDeleted'
import { CreateDocumentController } from '@/Document/Infrastructure/CreateDocumentController'
import { DeleteDocumentController } from '@/Document/Infrastructure/DeleteDocumentController'
import { DocumentAccessRepository } from '@/Document/Infrastructure/DocumentAccessRepository'
import { DocumentRepository } from '@/Document/Infrastructure/DocumentRepository'
import { DocumentsRepository } from '@/Document/Infrastructure/DocumentsRepository'
import { ListDocumentsController } from '@/Document/Infrastructure/ListDocumentsController'
import { RouteProvider } from '@/Document/Infrastructure/Router/RouteProvider'
import { CommandHandlerRegistryInterface } from '@/Shared/Application/Command/CommandHandlerRegistryInterface'
import { ControllerInterface } from '@/Shared/Application/Controller/ControllerInterface'
import { ListenerProviderInterface } from '@/Shared/Application/Event/ListenerProviderInterface'
import { RouteConfig } from '@/Shared/Application/Router/RouteConfig'
import { ServiceProviderInterface } from '@/Shared/Application/ServiceProviderInterface'
import { Symbols } from '@/Shared/Application/Symbols'

export class ServiceProvider implements ServiceProviderInterface {
  private routeProvider: RouteProvider

  constructor() {
    this.routeProvider = new RouteProvider()
  }

  getRoutes(): RouteConfig[] {
    return this.routeProvider.getRoutes()
  }

  register(container: InversifyContainer): void {
    container.bind<DocumentService>(DocumentService).toSelf().inSingletonScope()

    container
      .bind<CreateDocumentCommandHandler>(CreateDocumentCommandHandler)
      .toSelf()
      .inSingletonScope()

    container
      .bind<DocumentRepositoryInterface>(Symbols.DocumentRepositoryInterface)
      .to(DocumentRepository)
      .inSingletonScope()

    container
      .bind<DocumentAccessRepositoryInterface>(
        Symbols.DocumentAccessRepositoryInterface,
      )
      .to(DocumentAccessRepository)
      .inSingletonScope()

    container
      .bind<DocumentsRepositoryInterface>(Symbols.DocumentsRepositoryInterface)
      .to(DocumentsRepository)
      .inSingletonScope()

    container
      .bind<ControllerInterface>(Symbol.for(CreateDocumentController.name))
      .to(CreateDocumentController)

    container
      .bind<ControllerInterface>(Symbol.for(ListDocumentsController.name))
      .to(ListDocumentsController)

    container
      .bind<ControllerInterface>(Symbol.for(DeleteDocumentController.name))
      .to(DeleteDocumentController)

    container
      .bind<DocumentWasCreatedListener>(DocumentWasCreatedListener)
      .toSelf()
      .inSingletonScope()

    container
      .bind<DocumentWasDeletedListener>(DocumentWasDeletedListener)
      .toSelf()
      .inSingletonScope()

    const listenerProvider = container.get<ListenerProviderInterface>(
      Symbols.ListenerProviderInterface,
    )

    const createdListener = container.get<DocumentWasCreatedListener>(
      DocumentWasCreatedListener,
    )
    const deletedListener = container.get<DocumentWasDeletedListener>(
      DocumentWasDeletedListener,
    )

    listenerProvider.addListener(DocumentWasCreated, (event) => {
      createdListener.whenDocumentWasCreated(event as DocumentWasCreated)
    })
    listenerProvider.addListener(DocumentWasDeleted, (event) => {
      deletedListener.whenDocumentWasDeleted(event as DocumentWasDeleted)
    })

    const commandHandlerRegistry =
      container.get<CommandHandlerRegistryInterface>(
        Symbols.CommandHandlerRegistryInterface,
      )

    const createDocumentCommandHandler =
      container.get<CreateDocumentCommandHandler>(CreateDocumentCommandHandler)

    commandHandlerRegistry.register(
      CreateDocument,
      createDocumentCommandHandler,
    )
  }
}
