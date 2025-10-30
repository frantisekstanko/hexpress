import path from 'node:path'
import dotenv from 'dotenv'
import { ContainerFactory } from '@/ContainerFactory'
import { ConfigOption } from '@/Core/Application/Config/ConfigOption'
import { Services } from '@/Core/Application/Services'

dotenv.config({ path: path.join(process.cwd(), '.env.defaults') })
dotenv.config({ path: path.join(process.cwd(), '.env.local'), override: true })

const container = ContainerFactory.create()
const config = container.get(Services.ConfigInterface)
const logger = container.get(Services.LoggerInterface)

startServer()

function startServer() {
  const applicationFactory = container.get(Services.ApplicationFactoryInterface)
  const app = applicationFactory.create()
  const port = Number(config.get(ConfigOption.HTTP_PORT))

  app.listen(port, () => {
    logger.info(`Server running on port ${port.toString()}`)
    logger.info(`Environment: ${config.get(ConfigOption.NODE_ENV)}`)
  })

  const webSocketService = container.get(Services.WebSocketServerInterface)
  webSocketService.initialize()
}

async function stopServer(signal: string) {
  const logger = container.get(Services.LoggerInterface)
  logger.info(`Received ${signal}, shutting down gracefully`)

  await container.shutdown()
  process.exit(0)
}

process.on('SIGINT', () => {
  stopServer('SIGINT').catch((error: unknown) => {
    console.error('Error during shutdown:', error)
    process.exit(1)
  })
})

process.on('SIGTERM', () => {
  stopServer('SIGTERM').catch((error: unknown) => {
    console.error('Error during shutdown:', error)
    process.exit(1)
  })
})
