import { IncomingMessage } from 'node:http'
import { inject, injectable } from 'inversify'
import WebSocket from 'ws'
import { ConfigInterface } from '@/Shared/Application/Config/ConfigInterface'
import { ConfigOption } from '@/Shared/Application/Config/ConfigOption'
import { DatabaseContextInterface } from '@/Shared/Application/Database/DatabaseContextInterface'
import { LoggerInterface } from '@/Shared/Application/LoggerInterface'
import { Symbols } from '@/Shared/Application/Symbols'
import { WebSocketServerInterface } from '@/Shared/Application/WebSocketServerInterface'

@injectable()
export class WebSocketServer implements WebSocketServerInterface {
  private wss: WebSocket.WebSocketServer | null = null
  private authenticatedClients = new Set<WebSocket>()
  private websocketIsClosing = false
  private heartBeatInterval = 30000
  private authenticationTimeout = 3000

  constructor(
    @inject(Symbols.LoggerInterface) private logger: LoggerInterface,
    @inject(Symbols.DatabaseContextInterface)
    private databaseContext: DatabaseContextInterface,
    @inject(Symbols.ConfigInterface) private config: ConfigInterface,
  ) {}

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
          void (async () => {
            let data: object

            let messageString: string
            if (Buffer.isBuffer(message)) {
              messageString = message.toString('utf8')
            } else if (message instanceof ArrayBuffer) {
              messageString = new TextDecoder().decode(message)
            } else {
              messageString = message.toString()
            }

            try {
              data = JSON.parse(messageString) as object
            } catch {
              this.logger.info(`Received invalid JSON: ${messageString}`)
              return
            }

            if (
              'type' in data &&
              data.type === 'chat_message' &&
              'message' in data &&
              typeof data.message === 'string'
            ) {
              this.handleChatMessage(data.message)

              return
            }

            if (
              'type' in data &&
              'token' in data &&
              typeof data.token === 'string'
            ) {
              const isValid = await this.isTokenValid(data.token)

              if (!isValid) {
                this.logger.info('Authentication failed. Closing connection.')
                websocket.send('auth_failed')
                websocket.close()
                return
              }

              this.authenticatedClients.add(websocket)

              this.logger.info(
                `New client authenticated. Number of authenticated clients: ${this.authenticatedClients.size.toString()}`,
              )

              clearTimeout(authTimeout)

              return
            }

            websocket.close()
            return
          })()
        })

        websocket.on('close', () => {
          this.logger.info('WebSocket connection closed')
          clearTimeout(authTimeout)
          clearInterval(pingInterval)
          this.authenticatedClients.delete(websocket)
        })
      },
    )

    process.on('SIGINT', () => {
      void this.shutdown()
    })
  }

  public async shutdown(): Promise<void> {
    if (this.websocketIsClosing) return
    this.websocketIsClosing = true
    this.logger.info('Shutting down WebSocket server...')
    this.logger.info('Disconnecting all clients...')
    this.authenticatedClients.forEach((client) => {
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

    this.authenticatedClients.forEach((client: WebSocket) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message)
      }
    })
  }

  public getClients(): Set<WebSocket> {
    return this.authenticatedClients
  }

  private async isTokenValid(token: string): Promise<boolean> {
    try {
      const result = await this.databaseContext
        .getCurrentDatabase()
        .query(
          'SELECT 1 FROM refresh_tokens WHERE token = ? AND expires_at > UNIX_TIMESTAMP()',
          [token],
        )

      return result.length > 0
    } catch (error) {
      this.logger.error('Database Error during token validation:', error)
      return false
    }
  }

  private handleChatMessage(message: string): void {
    message = this.getTime() + message
    this.broadcast(JSON.stringify({ type: 'chat_message', message }))
  }

  private getTime(): string {
    const now = new Date()
    const hours = now.getHours().toString().padStart(2, '0')
    const minutes = now.getMinutes().toString().padStart(2, '0')
    const seconds = now.getSeconds().toString().padStart(2, '0')
    return `[${hours}:${minutes}:${seconds}] `
  }
}
