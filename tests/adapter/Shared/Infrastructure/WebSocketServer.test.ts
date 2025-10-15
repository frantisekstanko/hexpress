import { AdapterTester } from '@Tests/_support/AdapterTester'
import { MockLogger } from '@Tests/_support/mocks/MockLogger'
import WebSocket from 'ws'
import { ConfigOption } from '@/Shared/Application/Config/ConfigOption'
import { DateTime } from '@/Shared/Domain/Clock/DateTime'
import { Config } from '@/Shared/Infrastructure/Config'
import { WebSocketServer } from '@/Shared/Infrastructure/WebSocketServer'

const VALID_TOKEN = 'valid-token-123'
const INVALID_TOKEN = 'invalid-token-456'
const USER_ID = '315c9627-69bf-4a93-80cf-68bfd0ca1695'

describe('WebSocketServer', () => {
  const tester = AdapterTester.setup()
  let server: WebSocketServer
  let logger: MockLogger
  let config: Config

  const newWebsocketClient = (): WebSocket => {
    return new WebSocket(
      `ws://localhost:${config.get(ConfigOption.WEBSOCKET_PORT)}`,
      {
        headers: {
          origin: config.getAllowedOrigins()[0],
        },
      },
    )
  }

  beforeEach(async () => {
    logger = new MockLogger()
    config = new Config()
    const timeNow = new DateTime()
    const oneHourInTheFuture = DateTime.fromUnixtime(
      timeNow.toUnixtime() + 3600,
    )

    await tester.database.query(
      'INSERT INTO users (userId, username, password) VALUES (?, ?, ?)',
      [USER_ID, 'testuser', 'hashed_password'],
    )

    await tester.database.query(
      'INSERT INTO refresh_tokens (token, userId, created_at, expires_at) VALUES (?, ?, ?, ?)',
      [
        VALID_TOKEN,
        USER_ID,
        timeNow.toUnixtime(),
        oneHourInTheFuture.toUnixtime(),
      ],
    )

    server = new WebSocketServer(logger, tester.getDatabase(), config)
  })

  afterEach(async () => {
    await server.shutdown()
  })

  describe('initialize', () => {
    it('should start websocket server on configured port', () => {
      server.initialize()

      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('WebSocket server started on port'),
      )
    })
  })

  describe('authentication', () => {
    it('should authenticate client with valid token', async () => {
      server.initialize()

      const client = newWebsocketClient()

      await new Promise<void>((resolve) => {
        client.on('open', () => {
          client.send(JSON.stringify({ type: 'auth', token: VALID_TOKEN }))
          resolve()
        })
      })

      await new Promise((resolve) => setTimeout(resolve, 100))

      expect(server.getClients().size).toBe(1)

      client.close()
    })

    it('should reject client with invalid token', async () => {
      server.initialize()

      const client = newWebsocketClient()

      const closedPromise = new Promise<void>((resolve) => {
        client.on('close', () => {
          resolve()
        })
      })

      await new Promise<void>((resolve) => {
        client.on('open', () => {
          client.send(JSON.stringify({ type: 'auth', token: INVALID_TOKEN }))
          resolve()
        })
      })

      await closedPromise

      expect(server.getClients().size).toBe(0)
    })

    it('should reject connection from invalid origin', async () => {
      server.initialize()

      const client = new WebSocket(
        `ws://localhost:${config.get(ConfigOption.WEBSOCKET_PORT)}`,
        {
          headers: {
            origin: 'https://malicious-site.com',
          },
        },
      )

      const closedPromise = new Promise<void>((resolve) => {
        client.on('close', () => {
          resolve()
        })
      })

      await closedPromise

      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Connection refused due to invalid origin'),
      )
    })
  })

  describe('broadcast', () => {
    it('should send message to all authenticated clients', async () => {
      server.initialize()

      const client1 = newWebsocketClient()

      const client2 = newWebsocketClient()

      const messagePromise1 = new Promise<string>((resolve) => {
        client1.on('message', (data: unknown) => {
          resolve(String(data))
        })
      })

      const messagePromise2 = new Promise<string>((resolve) => {
        client2.on('message', (data: unknown) => {
          resolve(String(data))
        })
      })

      await new Promise<void>((resolve) => {
        let openCount = 0
        const onOpen = () => {
          openCount++
          if (openCount === 2) {
            client1.send(JSON.stringify({ type: 'auth', token: VALID_TOKEN }))
            client2.send(JSON.stringify({ type: 'auth', token: VALID_TOKEN }))
            resolve()
          }
        }
        client1.on('open', onOpen)
        client2.on('open', onOpen)
      })

      await new Promise((resolve) => setTimeout(resolve, 100))

      server.broadcast('test message')

      const [message1, message2] = await Promise.all([
        messagePromise1,
        messagePromise2,
      ])

      expect(message1).toBe('test message')
      expect(message2).toBe('test message')

      client1.close()
      client2.close()
    })
  })

  describe('shutdown', () => {
    it('should close all client connections', async () => {
      server.initialize()

      const client = newWebsocketClient()

      await new Promise<void>((resolve) => {
        client.on('open', () => {
          client.send(JSON.stringify({ type: 'auth', token: VALID_TOKEN }))
          resolve()
        })
      })

      await new Promise((resolve) => setTimeout(resolve, 100))

      expect(server.getClients().size).toBe(1)

      const closedPromise = new Promise<void>((resolve) => {
        client.on('close', () => {
          resolve()
        })
      })

      await server.shutdown()

      await closedPromise

      expect(server.getClients().size).toBe(0)
    })
  })
})
