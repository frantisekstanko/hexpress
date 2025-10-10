import { MockWebSocketServer } from '@Tests/_support/mocks/MockWebSocketServer'
import { DocumentWasDeletedListener } from '@/Document/Application/DocumentWasDeletedListener'
import { DocumentId } from '@/Document/Domain/DocumentId'
import { DocumentWasDeleted } from '@/Document/Domain/DocumentWasDeleted'

describe('DocumentWasDeletedListener', () => {
  let listener: DocumentWasDeletedListener
  let webSocketServer: MockWebSocketServer

  beforeEach(() => {
    webSocketServer = new MockWebSocketServer()
    listener = new DocumentWasDeletedListener(webSocketServer)
  })

  it('should broadcast update when DocumentWasDeleted event is dispatched', () => {
    const event = new DocumentWasDeleted({
      documentId: DocumentId.fromString('e4926347-80ca-44ed-92fe-70c8f112c537'),
    })

    listener.whenDocumentWasDeleted(event)

    expect(webSocketServer.broadcast).toHaveBeenCalledWith('update')
  })
})
