import path from 'node:path'
import dotenv from 'dotenv'
import { ApplicationFactoryInterface } from '@/Core/Application/ApplicationFactoryInterface'
import { ConfigInterface } from '@/Core/Application/Config/ConfigInterface'
import { ConfigOption } from '@/Core/Application/Config/ConfigOption'
import { LoggerInterface } from '@/Core/Application/LoggerInterface'
import { Symbols } from '@/Core/Application/Symbols'
import { ContainerFactory } from '@/Core/Infrastructure/ContainerFactory'

dotenv.config({ path: path.join(process.cwd(), '.env.defaults') })
dotenv.config({ path: path.join(process.cwd(), '.env.local'), override: true })

const container = ContainerFactory.create()
const config = container.get<ConfigInterface>(Symbols.ConfigInterface)
const logger = container.get<LoggerInterface>(Symbols.LoggerInterface)

startServer()

function startServer() {
  const applicationFactory = container.get<ApplicationFactoryInterface>(
    Symbols.ApplicationFactoryInterface,
  )
  const app = applicationFactory.create()
  const port = Number(config.get(ConfigOption.HTTP_PORT))

  app.listen(port, () => {
    logger.info(`Server running on port ${port.toString()}`)
    logger.info(`Environment: ${config.get(ConfigOption.NODE_ENV)}`)
  })

  const webSocketService = container.get(Symbols.WebSocketServerInterface)
  webSocketService.initialize()
}

async function stopServer(signal: string) {
  const logger = container.get<LoggerInterface>(Symbols.LoggerInterface)
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
