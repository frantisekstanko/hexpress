import 'reflect-metadata'
import { Container as InversifyContainer } from 'inversify'
import { Constructor } from '@/Core/Application/Constructor'
import { ContainerInterface } from '@/Core/Application/ContainerInterface'
import { DatabaseConnectionInterface } from '@/Core/Application/Database/DatabaseConnectionInterface'
import { LoggerInterface } from '@/Core/Application/LoggerInterface'
import { ServiceProviderInterface } from '@/Core/Application/ServiceProviderInterface'
import { Services } from '@/Core/Application/Services'
import { ServiceToken } from '@/Core/Application/ServiceToken'
import { WebSocketServerInterface } from '@/Core/Application/WebSocketServerInterface'
import { ServiceProviderRegistry } from '@/ServiceProviderRegistry'

export class Container implements ContainerInterface {
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
      serviceProvider.register(this)
    })
  }

  public getRegistry(): ServiceProviderRegistry {
    if (!this.registry) {
      throw new Error('ServiceProviderRegistry not initialized')
    }
    return this.registry
  }

  public registerSingleton<T>(
    identifier: ServiceToken<T>,
    implementation: Constructor<T>,
  ): void {
    this.inversifyContainer
      .bind<T>(identifier)
      .to(implementation)
      .inSingletonScope()
  }

  public registerSingletonToSelf<T>(implementation: Constructor<T>): void {
    this.inversifyContainer.bind<T>(implementation).toSelf().inSingletonScope()
  }

  public registerTransient<T>(
    identifier: ServiceToken<T>,
    implementation: Constructor<T>,
  ): void {
    this.inversifyContainer.bind<T>(identifier).to(implementation)
  }

  public registerAlias<T>(
    alias: ServiceToken<T>,
    target: ServiceToken<T> | Constructor<T>,
  ): void {
    this.inversifyContainer.bind<T>(alias).toService(target)
  }

  public registerConstant<T>(identifier: ServiceToken<T>, value: T): void {
    this.inversifyContainer.bind(identifier).toConstantValue(value)
  }

  public async shutdown(): Promise<void> {
    const logger = this.inversifyContainer.get<LoggerInterface>(
      Services.LoggerInterface,
    )
    logger.info('Container shutdown initiated')

    const database = this.inversifyContainer.get<DatabaseConnectionInterface>(
      Services.DatabaseConnectionInterface,
    )
    await database.close()

    const websocket = this.inversifyContainer.get<WebSocketServerInterface>(
      Services.WebSocketServerInterface,
    )

    await websocket.shutdown()

    logger.close()
  }

  public get<T>(identifier: ServiceToken<T> | Constructor<T>): T {
    return this.inversifyContainer.get<T>(identifier)
  }

  public has(identifier: ServiceToken<unknown> | Constructor): boolean {
    return this.inversifyContainer.isBound(identifier)
  }

  public getServiceProviders(): ServiceProviderInterface[] {
    return this.serviceProviders
  }
}
