import { MockWebSocketServer } from '@Tests/_support/mocks/MockWebSocketServer'
import { DocumentWasCreatedListener } from '@/Document/Application/DocumentWasCreatedListener'
import { DocumentId } from '@/Document/Domain/DocumentId'
import { DocumentWasCreated } from '@/Document/Domain/DocumentWasCreated'
import { UserId } from '@/Shared/Domain/UserId'

describe('DocumentWasCreatedListener', () => {
  let listener: DocumentWasCreatedListener
  let webSocketServer: MockWebSocketServer

  beforeEach(() => {
    webSocketServer = new MockWebSocketServer()
    listener = new DocumentWasCreatedListener(webSocketServer)
  })

  it('should broadcast update when DocumentWasCreated event is dispatched', () => {
    const event = new DocumentWasCreated({
      documentId: DocumentId.fromString('e4926347-80ca-44ed-92fe-70c8f112c537'),
      documentName: 'Test Document',
      ownerId: UserId.fromString('93906a9e-250e-4151-b2e7-4f0ffcb3e11f'),
    })

    listener.whenDocumentWasCreated(event)

    expect(webSocketServer.broadcast).toHaveBeenCalledWith('update')
  })
})
