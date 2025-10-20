import { ContainerInterface } from '@/Core/Application/ContainerInterface'
import { RouteConfig } from '@/Core/Application/Router/RouteConfig'
import { ServiceProviderInterface } from '@/Core/Application/ServiceProviderInterface'
import { Services as CoreServices } from '@/Core/Application/Services'
import { CreateDocumentCommandHandler } from '@/Document/Application/CreateDocumentCommandHandler'
import { DeleteDocumentCommandHandler } from '@/Document/Application/DeleteDocumentCommandHandler'
import { DocumentService } from '@/Document/Application/DocumentService'
import { DocumentWasCreatedListener } from '@/Document/Application/DocumentWasCreatedListener'
import { DocumentWasDeletedListener } from '@/Document/Application/DocumentWasDeletedListener'
import { Services } from '@/Document/Application/Services'
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
    container.registerFactory(
      DocumentService,
      (container) =>
        new DocumentService(
          container.get(CoreServices.UuidRepositoryInterface),
          container.get(Services.DocumentRepositoryInterface),
          container.get(CoreServices.EventDispatcherInterface),
        ),
    )

    container.registerFactory(
      CreateDocumentCommandHandler,
      (container) =>
        new CreateDocumentCommandHandler(container.get(DocumentService)),
    )

    container.registerFactory(
      DeleteDocumentCommandHandler,
      (container) =>
        new DeleteDocumentCommandHandler(container.get(DocumentService)),
    )

    container.registerFactory(
      Services.DocumentRepositoryInterface,
      (container) =>
        new DocumentRepository(
          container.get(CoreServices.DatabaseContextInterface),
        ),
    )

    container.registerFactory(
      Services.DocumentAccessRepositoryInterface,
      (container) =>
        new DocumentAccessRepository(
          container.get(CoreServices.DatabaseContextInterface),
        ),
    )

    container.registerFactory(
      Services.DocumentsRepositoryInterface,
      (container) =>
        new DocumentsRepository(
          container.get(CoreServices.DatabaseContextInterface),
        ),
    )

    container.registerFactory(
      Symbol.for(CreateDocumentController.name),
      (container) =>
        new CreateDocumentController(
          container.get(CoreServices.CommandBusInterface),
        ),
    )

    container.registerFactory(
      Symbol.for(ListDocumentsController.name),
      (container) =>
        new ListDocumentsController(
          container.get(Services.DocumentsRepositoryInterface),
        ),
    )

    container.registerFactory(
      Symbol.for(DeleteDocumentController.name),
      (container) =>
        new DeleteDocumentController(
          container.get(CoreServices.CommandBusInterface),
          container.get(Services.DocumentAccessRepositoryInterface),
        ),
    )

    container.registerFactory(
      DocumentWasCreatedListener,
      (container) =>
        new DocumentWasCreatedListener(
          container.get(CoreServices.NotificationServiceInterface),
        ),
    )

    container.registerFactory(
      DocumentWasDeletedListener,
      (container) =>
        new DocumentWasDeletedListener(
          container.get(CoreServices.NotificationServiceInterface),
        ),
    )

    EventListenerRegistry.register(container)
    CommandHandlerRegistry.register(container)
  }
}
