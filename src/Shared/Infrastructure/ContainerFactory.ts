import { ServiceProviderRegistry } from '@/ServiceProviderRegistry'
import { Symbols } from '@/Shared/Application/Symbols'
import { Container } from '@/Shared/Infrastructure/Container'
import { RouterFactory } from '@/Shared/Infrastructure/Router/RouterFactory'
import { RouterInterface } from '@/Shared/Infrastructure/Router/RouterInterface'

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
