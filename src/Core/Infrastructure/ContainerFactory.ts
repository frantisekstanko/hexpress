import { Services } from '@/Core/Application/Services'
import { Container } from '@/Core/Infrastructure/Container'
import { ControllerResolver } from '@/Core/Infrastructure/ControllerResolver'
import { RouteProviderChain } from '@/Core/Infrastructure/Router/RouteProviderChain'
import { Router } from '@/Core/Infrastructure/Router/Router'
import { RouteProviderRegistry } from '@/RouteProviderRegistry'
import { ServiceProviderRegistry } from '@/ServiceProviderRegistry'

export class ContainerFactory {
  public static create(): Container {
    const serviceProviderRegistry = new ServiceProviderRegistry()
    const container = new Container()

    container.setRegistry(serviceProviderRegistry)

    const controllerResolver = new ControllerResolver(container)
    container.register(
      Services.ControllerResolverInterface,
      () => controllerResolver,
    )

    container.registerServiceProviders(
      serviceProviderRegistry.getServiceProviders(),
    )

    const routeProviderRegistry = new RouteProviderRegistry(container)
    const routeProviderChain = new RouteProviderChain(
      routeProviderRegistry.getRouteProviders(),
    )
    container.register(
      Services.RouteProviderInterface,
      () => routeProviderChain,
    )

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
