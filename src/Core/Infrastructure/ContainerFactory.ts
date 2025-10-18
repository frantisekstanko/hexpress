import { ControllerResolverInterface } from '@/Core/Application/Controller/ControllerResolverInterface'
import { RouteProviderInterface } from '@/Core/Application/Router/RouteProviderInterface'
import { Symbols } from '@/Core/Application/Symbols'
import { Container } from '@/Core/Infrastructure/Container'
import { ControllerResolver } from '@/Core/Infrastructure/ControllerResolver'
import { RouteProviderChain } from '@/Core/Infrastructure/Router/RouteProviderChain'
import { Router } from '@/Core/Infrastructure/Router/Router'
import { RouterInterface } from '@/Core/Infrastructure/Router/RouterInterface'
import { ServiceProviderRegistry } from '@/ServiceProviderRegistry'

export class ContainerFactory {
  public static create(): Container {
    const registry = new ServiceProviderRegistry()
    const container = new Container()

    container.setRegistry(registry)

    const controllerResolver = new ControllerResolver(container)
    container
      .getInversifyContainer()
      .bind<ControllerResolverInterface>(Symbols.ControllerResolverInterface)
      .toConstantValue(controllerResolver)

    const routeProviderChain = new RouteProviderChain(
      registry.getServiceProviders(),
    )
    container
      .getInversifyContainer()
      .bind<RouteProviderInterface>(Symbols.RouteProviderInterface)
      .toConstantValue(routeProviderChain)

    container.registerServiceProviders(registry.getServiceProviders())

    container
      .getInversifyContainer()
      .bind<RouterInterface>(Symbols.RouterInterface)
      .to(Router)
      .inSingletonScope()

    return container
  }
}
