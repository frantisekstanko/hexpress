import { Symbols } from '@/Core/Application/Symbols'
import { Container } from '@/Core/Infrastructure/Container'
import { ControllerResolver } from '@/Core/Infrastructure/ControllerResolver'
import { RouteProviderChain } from '@/Core/Infrastructure/Router/RouteProviderChain'
import { Router } from '@/Core/Infrastructure/Router/Router'
import { ServiceProviderRegistry } from '@/ServiceProviderRegistry'

export class ContainerFactory {
  public static create(): Container {
    const registry = new ServiceProviderRegistry()
    const container = new Container()

    container.setRegistry(registry)

    const controllerResolver = new ControllerResolver(container)
    container.registerConstant(
      Symbols.ControllerResolverInterface,
      controllerResolver,
    )

    const routeProviderChain = new RouteProviderChain(
      registry.getServiceProviders(),
    )
    container.registerConstant(
      Symbols.RouteProviderInterface,
      routeProviderChain,
    )

    container.registerServiceProviders(registry.getServiceProviders())

    container.registerSingleton(Symbols.RouterInterface, Router)

    return container
  }
}
