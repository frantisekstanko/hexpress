import { Services } from '@/Core/Application/Services'
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
    container.register(
      Services.ControllerResolverInterface,
      () => controllerResolver,
    )

    const routeProviderChain = new RouteProviderChain(
      registry.getServiceProviders(),
    )
    container.register(
      Services.RouteProviderInterface,
      () => routeProviderChain,
    )

    container.registerServiceProviders(registry.getServiceProviders())

    container.register(
      Services.RouterInterface,
      (container) =>
        new Router(
          container.get(Services.ControllerResolverInterface),
          container.get(Services.RouteProviderInterface),
        ),
    )

    return container
  }
}
