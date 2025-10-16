import { Symbols } from '@/Core/Application/Symbols'
import { Container } from '@/Core/Infrastructure/Container'
import { RouterFactory } from '@/Core/Infrastructure/Router/RouterFactory'
import { RouterInterface } from '@/Core/Infrastructure/Router/RouterInterface'
import { ServiceProviderRegistry } from '@/ServiceProviderRegistry'

export class ContainerFactory {
  public static create(): Container {
    const registry = new ServiceProviderRegistry()
    const container = new Container()

    container.setRegistry(registry)

    container
      .getInversifyContainer()
      .bind<Container>(Symbols.Container)
      .toConstantValue(container)

    container.registerServiceProviders(registry.getServiceProviders())

    container
      .getInversifyContainer()
      .bind<RouterInterface>(Symbols.RouterInterface)
      .toDynamicValue(() => RouterFactory.create(container, registry))
      .inSingletonScope()

    return container
  }
}
