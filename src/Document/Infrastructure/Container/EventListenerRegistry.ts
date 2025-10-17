import { Container as InversifyContainer } from 'inversify'
import { ListenerProviderInterface } from '@/Core/Application/Event/ListenerProviderInterface'
import { Symbols as CoreSymbols } from '@/Core/Application/Symbols'
import { DocumentWasCreatedListener } from '@/Document/Application/DocumentWasCreatedListener'
import { DocumentWasDeletedListener } from '@/Document/Application/DocumentWasDeletedListener'
import { DocumentWasCreated } from '@/Document/Domain/DocumentWasCreated'
import { DocumentWasDeleted } from '@/Document/Domain/DocumentWasDeleted'

export class EventListenerRegistry {
  static register(container: InversifyContainer): void {
    const listenerProvider = container.get<ListenerProviderInterface>(
      CoreSymbols.ListenerProviderInterface,
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
  }
}
