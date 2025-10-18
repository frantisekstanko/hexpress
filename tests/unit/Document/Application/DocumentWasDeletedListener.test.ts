import { MockNotificationService } from '@Tests/_support/mocks/MockNotificationService'
import { UserId } from '@/Core/Domain/UserId'
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

  it('should notify user when DocumentWasDeleted event is dispatched', () => {
    const ownerId = UserId.fromString('93906a9e-250e-4151-b2e7-4f0ffcb3e11f')
    const event = new DocumentWasDeleted({
      documentId: DocumentId.fromString('e4926347-80ca-44ed-92fe-70c8f112c537'),
      ownerId,
    })

    listener.whenDocumentWasDeleted(event)

    expect(notificationService.notifyUser).toHaveBeenCalledWith(ownerId, {
      type: 'DocumentWasDeleted',
      data: {
        documentId: 'e4926347-80ca-44ed-92fe-70c8f112c537',
      },
    })
  })
})
