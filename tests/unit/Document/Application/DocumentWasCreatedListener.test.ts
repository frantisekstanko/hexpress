import { MockNotificationService } from '@Tests/_support/mocks/MockNotificationService'
import { UserId } from '@/Core/Domain/UserId'
import { DocumentWasCreatedListener } from '@/Document/Application/DocumentWasCreatedListener'
import { DocumentId } from '@/Document/Domain/DocumentId'
import { DocumentWasCreated } from '@/Document/Domain/DocumentWasCreated'

describe('DocumentWasCreatedListener', () => {
  let listener: DocumentWasCreatedListener
  let notificationService: MockNotificationService

  beforeEach(() => {
    notificationService = new MockNotificationService()
    listener = new DocumentWasCreatedListener(notificationService)
  })

  it('should notify user when DocumentWasCreated event is dispatched', () => {
    const ownerId = UserId.fromString('93906a9e-250e-4151-b2e7-4f0ffcb3e11f')
    const event = new DocumentWasCreated({
      documentId: DocumentId.fromString('e4926347-80ca-44ed-92fe-70c8f112c537'),
      documentName: 'Test Document',
      ownerId,
    })

    listener.whenDocumentWasCreated(event)

    expect(notificationService.notifyUser).toHaveBeenCalledWith(ownerId, {
      type: 'DocumentWasCreated',
      data: {
        documentId: 'e4926347-80ca-44ed-92fe-70c8f112c537',
        documentName: 'Test Document',
      },
    })
  })
})
