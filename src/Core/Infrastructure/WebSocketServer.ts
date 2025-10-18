import { IncomingMessage } from 'node:http'
import { inject, injectable } from 'inversify'
import WebSocket from 'ws'
import { AuthenticatedUser } from '@/Authentication/Application/AuthenticatedUser'
import { LoginService } from '@/Authentication/Application/LoginService'
import { ConfigInterface } from '@/Core/Application/Config/ConfigInterface'
import { ConfigOption } from '@/Core/Application/Config/ConfigOption'
import { LoggerInterface } from '@/Core/Application/LoggerInterface'
import { Symbols as CoreSymbols } from '@/Core/Application/Symbols'
import { WebSocketMessageParserInterface } from '@/Core/Application/WebSocket/WebSocketMessageParserInterface'
import { WebSocketServerInterface } from '@/Core/Application/WebSocketServerInterface'
import { Assertion } from '@/Core/Domain/Assert/Assertion'
import { UserId } from '@/Core/Domain/UserId'

@injectable()
export class WebSocketServer implements WebSocketServerInterface {
  private wss: WebSocket.WebSocketServer | null = null
  private authenticatedClients = new Map<WebSocket, AuthenticatedUser>()
  private websocketIsClosing = false
  private readonly heartBeatInterval: number
  private readonly authenticationTimeout: number

  constructor(
    @inject(CoreSymbols.LoggerInterface) private logger: LoggerInterface,
    @inject(CoreSymbols.ConfigInterface) private config: ConfigInterface,
    @inject(CoreSymbols.WebSocketMessageParserInterface)
    private readonly messageParser: WebSocketMessageParserInterface,
    @inject(LoginService)
    private readonly loginService: LoginService,
  ) {
    const heartBeatInterval = Number(
      this.config.get(ConfigOption.WEBSOCKET_HEARTBEAT_INTERVAL_MS),
    )
    const authenticationTimeout = Number(
      this.config.get(ConfigOption.WEBSOCKET_AUTH_TIMEOUT_MS),
    )

    Assertion.number(
      heartBeatInterval,
      'WebSocket heartbeat interval must be a number',
    )
    Assertion.number(
      authenticationTimeout,
      'WebSocket authentication timeout must be a number',
    )
    Assertion.greaterThan(
      heartBeatInterval,
      0,
      'WebSocket heartbeat interval must be greater than 0',
    )
    Assertion.greaterThan(
      authenticationTimeout,
      0,
      'WebSocket authentication timeout must be greater than 0',
    )

    this.heartBeatInterval = heartBeatInterval
    this.authenticationTimeout = authenticationTimeout
  }

  public initialize(): void {
    const wsPort = this.config.get(ConfigOption.WEBSOCKET_PORT)
    this.wss = new WebSocket.WebSocketServer({ port: Number(wsPort) })

    const allowedOrigins = this.config.getAllowedOrigins()

    this.logger.info(`WebSocket server started on port ${wsPort}`)

    this.wss.on(
      'connection',
      (websocket: WebSocket, request: IncomingMessage) => {
        if (this.websocketIsClosing) {
          this.logger.info('Refusing connection because server is closing')
          websocket.close()
          return
        }

        const origin = request.headers.origin

        if (!allowedOrigins.includes(origin ?? '')) {
          this.logger.info(
            `Connection refused due to invalid origin: ${origin ?? 'unknown'}`,
          )
          websocket.close()
          return
        }

        const authTimeout = setTimeout(() => {
          this.logger.info(
            'Authentication timeout reached. Closing connection.',
          )
          websocket.close()
        }, this.authenticationTimeout)

        const pingInterval = setInterval(() => {
          if (websocket.readyState === WebSocket.OPEN) {
            websocket.ping()
          }
        }, this.heartBeatInterval)

        websocket.on('message', (message: WebSocket.RawData) => {
          let data: object

          try {
            data = this.messageParser.parseMessage(message)
          } catch {
            this.logger.info('Received invalid JSON message')
            return
          }

          if (
            'type' in data &&
            'token' in data &&
            typeof data.token === 'string'
          ) {
            try {
              const payload = this.loginService.verifyAccessToken(data.token)
              const userId = UserId.fromString(payload.userId)
              const authenticatedUser = new AuthenticatedUser(userId)

              this.authenticatedClients.set(websocket, authenticatedUser)

              this.logger.info(
                `New client authenticated. Number of authenticated clients: ${this.authenticatedClients.size.toString()}`,
              )

              clearTimeout(authTimeout)

              return
            } catch {
              this.logger.info('Authentication failed. Closing connection.')
              websocket.send('auth_failed')
              websocket.close()
              return
            }
          }

          websocket.close()
          return
        })

        websocket.on('close', () => {
          this.logger.info('WebSocket connection closed')
          clearTimeout(authTimeout)
          clearInterval(pingInterval)
          this.authenticatedClients.delete(websocket)
        })
      },
    )
  }

  public async shutdown(): Promise<void> {
    if (this.websocketIsClosing) return
    this.websocketIsClosing = true
    this.logger.info('Shutting down WebSocket server...')
    this.logger.info('Disconnecting all clients...')
    this.authenticatedClients.forEach((user, client) => {
      client.close()
    })
    this.authenticatedClients.clear()
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

  public broadcast(message: string): void {
    if (!this.wss) return

    this.authenticatedClients.forEach((user, client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message)
      }
    })
  }

  public broadcastToUser(userId: UserId, message: string): void {
    if (!this.wss) return

    this.authenticatedClients.forEach((user, client) => {
      if (
        user.getUserId().equals(userId) &&
        client.readyState === WebSocket.OPEN
      ) {
        client.send(message)
      }
    })
  }

  public getClients(): Map<WebSocket, AuthenticatedUser> {
    return this.authenticatedClients
  }
}
