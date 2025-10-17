import { Container as InversifyContainer } from 'inversify'
import { ControllerInterface } from '@/Core/Application/Controller/ControllerInterface'
import { RouteConfig } from '@/Core/Application/Router/RouteConfig'
import { ServiceProviderInterface } from '@/Core/Application/ServiceProviderInterface'
import { CreateDocumentCommandHandler } from '@/Document/Application/CreateDocumentCommandHandler'
import { DeleteDocumentCommandHandler } from '@/Document/Application/DeleteDocumentCommandHandler'
import { DocumentAccessRepositoryInterface } from '@/Document/Application/DocumentAccessRepositoryInterface'
import { DocumentService } from '@/Document/Application/DocumentService'
import { DocumentsRepositoryInterface } from '@/Document/Application/DocumentsRepositoryInterface'
import { DocumentWasCreatedListener } from '@/Document/Application/DocumentWasCreatedListener'
import { DocumentWasDeletedListener } from '@/Document/Application/DocumentWasDeletedListener'
import { Symbols as DocumentSymbols } from '@/Document/Application/Symbols'
import { DocumentRepositoryInterface } from '@/Document/Domain/DocumentRepositoryInterface'
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

  register(container: InversifyContainer): void {
    container.bind<DocumentService>(DocumentService).toSelf().inSingletonScope()

    container
      .bind<CreateDocumentCommandHandler>(CreateDocumentCommandHandler)
      .toSelf()
      .inSingletonScope()

    container
      .bind<DeleteDocumentCommandHandler>(DeleteDocumentCommandHandler)
      .toSelf()
      .inSingletonScope()

    container
      .bind<DocumentRepositoryInterface>(
        DocumentSymbols.DocumentRepositoryInterface,
      )
      .to(DocumentRepository)
      .inSingletonScope()

    container
      .bind<DocumentAccessRepositoryInterface>(
        DocumentSymbols.DocumentAccessRepositoryInterface,
      )
      .to(DocumentAccessRepository)
      .inSingletonScope()

    container
      .bind<DocumentsRepositoryInterface>(
        DocumentSymbols.DocumentsRepositoryInterface,
      )
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

    EventListenerRegistry.register(container)
    CommandHandlerRegistry.register(container)
  }
}
