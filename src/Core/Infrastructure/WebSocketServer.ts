import { IncomingMessage } from 'node:http'
import WebSocket from 'ws'
import { ConfigInterface } from '@/Core/Application/Config/ConfigInterface'
import { ConfigOption } from '@/Core/Application/Config/ConfigOption'
import { LoggerInterface } from '@/Core/Application/LoggerInterface'
import { BroadcasterInterface } from '@/Core/Application/WebSocket/BroadcasterInterface'
import { ClientConnectionInterface } from '@/Core/Application/WebSocket/ClientConnectionInterface'
import { ConnectionManagerInterface } from '@/Core/Application/WebSocket/ConnectionManagerInterface'
import { WebSocketServerInterface } from '@/Core/Application/WebSocketServerInterface'
import { AuthenticatedUser } from '@/Core/Domain/AuthenticatedUser'
import { UserId } from '@/Core/Domain/UserId'

export class WebSocketServer implements WebSocketServerInterface {
  private wss: WebSocket.WebSocketServer | null = null
  private websocketIsClosing = false

  constructor(
    private readonly logger: LoggerInterface,
    private readonly config: ConfigInterface,
    private readonly broadcaster: BroadcasterInterface,
    private readonly connectionManager: ConnectionManagerInterface,
  ) {}

  public initialize(): void {
    const wsPort = this.config.get(ConfigOption.WEBSOCKET_PORT)
    this.wss = new WebSocket.WebSocketServer({ port: Number(wsPort) })

    this.logger.info(`WebSocket server started on port ${wsPort}`)

    this.wss.on(
      'connection',
      (websocket: WebSocket, request: IncomingMessage) => {
        if (this.websocketIsClosing) {
          this.logger.info('Refusing connection because server is closing')
          websocket.close()
          return
        }

        this.connectionManager.handleConnection(websocket, request)
      },
    )
  }

  public async shutdown(): Promise<void> {
    if (this.websocketIsClosing) return
    this.websocketIsClosing = true
    this.logger.info('Shutting down WebSocket server...')
    this.logger.info('Disconnecting all clients...')
    this.broadcaster.disconnectAll()
    await new Promise<void>((resolve) => {
      if (!this.wss) {
        resolve()
        return
      }
      this.wss.close(() => {
        resolve()
      })
    })
  }

  public broadcastToUser(userId: UserId, message: string): void {
    if (!this.wss) return
    this.broadcaster.broadcastToUser(userId, message)
  }

  public getClients(): Map<ClientConnectionInterface, AuthenticatedUser> {
    const clientMap = new Map<ClientConnectionInterface, AuthenticatedUser>()
    const authenticatedClients = this.broadcaster.getAuthenticatedClients()

    authenticatedClients.forEach((user, client) => {
      clientMap.set(client, user)
    })

    return clientMap
  }
}
