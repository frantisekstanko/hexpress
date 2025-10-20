import { DatabaseConnectionInterface } from '@/Core/Application/Database/DatabaseConnectionInterface'
import { LifecycleManagerInterface } from '@/Core/Application/LifecycleManagerInterface'
import { LoggerInterface } from '@/Core/Application/LoggerInterface'
import { WebSocketServerInterface } from '@/Core/Application/WebSocketServerInterface'

export class LifecycleManager implements LifecycleManagerInterface {
  constructor(
    private readonly logger: LoggerInterface,
    private readonly databaseConnection: DatabaseConnectionInterface,
    private readonly webSocketServer: WebSocketServerInterface,
  ) {}

  async shutdown(): Promise<void> {
    this.logger.info('Application shutdown initiated')

    await this.databaseConnection.close()
    await this.webSocketServer.shutdown()

    this.logger.close()
  }
}
