import { Container as InversifyContainer } from 'inversify'
import { Constructor } from '@/Core/Application/Constructor'
import { ContainerInterface } from '@/Core/Application/ContainerInterface'
import { LifecycleManagerInterface } from '@/Core/Application/LifecycleManagerInterface'
import { ServiceProviderInterface } from '@/Core/Application/ServiceProviderInterface'
import { Services } from '@/Core/Application/Services'
import { ServiceToken } from '@/Core/Application/ServiceToken'

export class Container implements ContainerInterface {
  private inversifyContainer: InversifyContainer
  private serviceProviders: ServiceProviderInterface[]

  public constructor() {
    this.inversifyContainer = new InversifyContainer()
    this.serviceProviders = []
  }

  public registerServiceProviders(
    serviceProviders: ServiceProviderInterface[],
  ): void {
    this.serviceProviders = serviceProviders

    this.serviceProviders.forEach((serviceProvider) => {
      serviceProvider.register(this)
    })
  }

  public register<T>(
    identifier: ServiceToken<T> | Constructor<T>,
    factory: (container: ContainerInterface) => T,
  ): void {
    this.inversifyContainer
      .bind<T>(identifier)
      .toDynamicValue(() => factory(this))
      .inSingletonScope()
  }

  public async shutdown(): Promise<void> {
    const lifecycleManager =
      this.inversifyContainer.get<LifecycleManagerInterface>(
        Services.LifecycleManagerInterface,
      )
    await lifecycleManager.shutdown()
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
