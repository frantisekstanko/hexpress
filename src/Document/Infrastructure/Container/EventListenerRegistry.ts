import { ContainerInterface } from '@/Core/Application/ContainerInterface'
import { Services } from '@/Core/Application/Services'
import { DocumentWasCreatedListener } from '@/Document/Application/DocumentWasCreatedListener'
import { DocumentWasDeletedListener } from '@/Document/Application/DocumentWasDeletedListener'
import { DocumentWasCreated } from '@/Document/Domain/DocumentWasCreated'
import { DocumentWasDeleted } from '@/Document/Domain/DocumentWasDeleted'

export class EventListenerRegistry {
  static register(container: ContainerInterface): void {
    const listenerProvider = container.get(Services.ListenerProviderInterface)

    const createdListener = container.get(DocumentWasCreatedListener)
    const deletedListener = container.get(DocumentWasDeletedListener)

    listenerProvider.addListener(DocumentWasCreated, (event) => {
      createdListener.whenDocumentWasCreated(event as DocumentWasCreated)
    })
    listenerProvider.addListener(DocumentWasDeleted, (event) => {
      deletedListener.whenDocumentWasDeleted(event as DocumentWasDeleted)
    })
  }
}
