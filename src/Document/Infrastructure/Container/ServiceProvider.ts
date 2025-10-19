import { ContainerInterface } from '@/Core/Application/ContainerInterface'
import { RouteConfig } from '@/Core/Application/Router/RouteConfig'
import { ServiceProviderInterface } from '@/Core/Application/ServiceProviderInterface'
import { CreateDocumentCommandHandler } from '@/Document/Application/CreateDocumentCommandHandler'
import { DeleteDocumentCommandHandler } from '@/Document/Application/DeleteDocumentCommandHandler'
import { DocumentService } from '@/Document/Application/DocumentService'
import { DocumentWasCreatedListener } from '@/Document/Application/DocumentWasCreatedListener'
import { DocumentWasDeletedListener } from '@/Document/Application/DocumentWasDeletedListener'
import { Symbols as DocumentSymbols } from '@/Document/Application/Symbols'
import { CommandHandlerRegistry } from '@/Document/Infrastructure/Container/CommandHandlerRegistry'
import { EventListenerRegistry } from '@/Document/Infrastructure/Container/EventListenerRegistry'
import { CreateDocumentController } from '@/Document/Infrastructure/CreateDocumentController'
import { DeleteDocumentController } from '@/Document/Infrastructure/DeleteDocumentController'
import { DocumentAccessRepository } from '@/Document/Infrastructure/DocumentAccessRepository'
import { DocumentRepository } from '@/Document/Infrastructure/DocumentRepository'
import { DocumentsRepository } from '@/Document/Infrastructure/DocumentsRepository'
import { ListDocumentsController } from '@/Document/Infrastructure/ListDocumentsController'
import { RouteProvider } from '@/Document/Infrastructure/Router/RouteProvider'

export class ServiceProvider implements ServiceProviderInterface {
  private routeProvider: RouteProvider

  constructor() {
    this.routeProvider = new RouteProvider()
  }

  getRoutes(): RouteConfig[] {
    return this.routeProvider.getRoutes()
  }

  register(container: ContainerInterface): void {
    container.registerSingletonToSelf(DocumentService)

    container.registerSingletonToSelf(CreateDocumentCommandHandler)

    container.registerSingletonToSelf(DeleteDocumentCommandHandler)

    container.registerSingleton(
      DocumentSymbols.DocumentRepositoryInterface,
      DocumentRepository,
    )

    container.registerSingleton(
      DocumentSymbols.DocumentAccessRepositoryInterface,
      DocumentAccessRepository,
    )

    container.registerSingleton(
      DocumentSymbols.DocumentsRepositoryInterface,
      DocumentsRepository,
    )

    container.registerTransient(
      Symbol.for(CreateDocumentController.name),
      CreateDocumentController,
    )

    container.registerTransient(
      Symbol.for(ListDocumentsController.name),
      ListDocumentsController,
    )

    container.registerTransient(
      Symbol.for(DeleteDocumentController.name),
      DeleteDocumentController,
    )

    container.registerSingletonToSelf(DocumentWasCreatedListener)

    container.registerSingletonToSelf(DocumentWasDeletedListener)

    EventListenerRegistry.register(container)
    CommandHandlerRegistry.register(container)
  }
}
