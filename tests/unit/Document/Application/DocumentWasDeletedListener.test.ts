import { MockNotificationService } from '@Tests/_support/mocks/MockNotificationService'
import { DocumentWasDeletedListener } from '@/Document/Application/DocumentWasDeletedListener'
import { DocumentId } from '@/Document/Domain/DocumentId'
import { DocumentWasDeleted } from '@/Document/Domain/DocumentWasDeleted'

describe('DocumentWasDeletedListener', () => {
  let listener: DocumentWasDeletedListener
  let notificationService: MockNotificationService

  beforeEach(() => {
    notificationService = new MockNotificationService()
    listener = new DocumentWasDeletedListener(notificationService)
  })

  it('should notify clients when DocumentWasDeleted event is dispatched', () => {
    const event = new DocumentWasDeleted({
      documentId: DocumentId.fromString('e4926347-80ca-44ed-92fe-70c8f112c537'),
    })

    listener.whenDocumentWasDeleted(event)

    expect(notificationService.notifyClients).toHaveBeenCalledWith('update')
  })
})
