import 'reflect-metadata'
import { Container as InversifyContainer } from 'inversify'
import { DatabaseConnectionInterface } from '@/Core/Application/Database/DatabaseConnectionInterface'
import { LoggerInterface } from '@/Core/Application/LoggerInterface'
import { ServiceProviderInterface } from '@/Core/Application/ServiceProviderInterface'
import { Symbols } from '@/Core/Application/Symbols'
import { WebSocketServerInterface } from '@/Core/Application/WebSocketServerInterface'
import { ServiceProviderRegistry } from '@/ServiceProviderRegistry'

export class Container {
  private inversifyContainer: InversifyContainer
  private serviceProviders: ServiceProviderInterface[]
  private registry?: ServiceProviderRegistry

  public constructor() {
    this.inversifyContainer = new InversifyContainer()
    this.serviceProviders = []
  }

  public setRegistry(registry: ServiceProviderRegistry): void {
    this.registry = registry
  }

  public registerServiceProviders(
    serviceProviders: ServiceProviderInterface[],
  ): void {
    this.serviceProviders = serviceProviders

    this.serviceProviders.forEach((serviceProvider) => {
      serviceProvider.register(this.inversifyContainer)
    })
  }

  public getRegistry(): ServiceProviderRegistry {
    if (!this.registry) {
      throw new Error('ServiceProviderRegistry not initialized')
    }
    return this.registry
  }

  public getInversifyContainer(): InversifyContainer {
    return this.inversifyContainer
  }

  public async shutdown(): Promise<void> {
    const logger = this.inversifyContainer.get<LoggerInterface>(
      Symbols.LoggerInterface,
    )
    logger.info('Container shutdown initiated')

    const database = this.inversifyContainer.get<DatabaseConnectionInterface>(
      Symbols.DatabaseConnectionInterface,
    )
    await database.close()

    const websocket = this.inversifyContainer.get<WebSocketServerInterface>(
      Symbols.WebSocketServerInterface,
    )

    await websocket.shutdown()

    logger.close()
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  public get<T>(identifier: symbol): T {
    return this.inversifyContainer.get<T>(identifier)
  }

  public has(identifier: symbol): boolean {
    return this.inversifyContainer.isBound(identifier)
  }

  public getServiceProviders(): ServiceProviderInterface[] {
    return this.serviceProviders
  }
}
