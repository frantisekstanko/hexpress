import { ContainerInterface } from '@/Core/Application/ContainerInterface'
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
import { DocumentRepository } from '@/Document/Infrastructure/DocumentRepository'
import { DocumentsRepository } from '@/Document/Infrastructure/DocumentsRepository'
import { ListDocumentsController } from '@/Document/Infrastructure/ListDocumentsController'

export class ServiceProvider implements ServiceProviderInterface {
  register(container: ContainerInterface): void {
    container.register(
      DocumentService,
      (container) =>
        new DocumentService(
          container.get(CoreServices.UuidRepositoryInterface),
          container.get(Services.DocumentRepositoryInterface),
          container.get(CoreServices.EventOutboxRepositoryInterface),
        ),
    )

    container.register(
      CreateDocumentCommandHandler,
      (container) =>
        new CreateDocumentCommandHandler(container.get(DocumentService)),
    )

    container.register(
      DeleteDocumentCommandHandler,
      (container) =>
        new DeleteDocumentCommandHandler(container.get(DocumentService)),
    )

    container.register(
      Services.DocumentRepositoryInterface,
      (container) =>
        new DocumentRepository(
          container.get(CoreServices.DatabaseContextInterface),
        ),
    )

    container.register(
      Services.DocumentsRepositoryInterface,
      (container) =>
        new DocumentsRepository(
          container.get(CoreServices.DatabaseContextInterface),
        ),
    )

    container.register(
      Symbol.for(CreateDocumentController.name),
      (container) =>
        new CreateDocumentController(
          container.get(CoreServices.CommandBusInterface),
        ),
    )

    container.register(
      Symbol.for(ListDocumentsController.name),
      (container) =>
        new ListDocumentsController(
          container.get(Services.DocumentsRepositoryInterface),
        ),
    )

    container.register(
      Symbol.for(DeleteDocumentController.name),
      (container) =>
        new DeleteDocumentController(
          container.get(CoreServices.CommandBusInterface),
          container.get(Services.DocumentsRepositoryInterface),
        ),
    )

    container.register(
      DocumentWasCreatedListener,
      (container) =>
        new DocumentWasCreatedListener(
          container.get(CoreServices.NotificationServiceInterface),
        ),
    )

    container.register(
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
