import { AuthenticationMiddleware } from '@/Authentication/Infrastructure/AuthenticationMiddleware'
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
    container.registerConstant(
      Services.ControllerResolverInterface,
      controllerResolver,
    )

    const routeProviderChain = new RouteProviderChain(
      registry.getServiceProviders(),
    )
    container.registerConstant(
      Services.RouteProviderInterface,
      routeProviderChain,
    )

    container.registerServiceProviders(registry.getServiceProviders())

    container.registerFactory(
      Services.RouterInterface,
      (container) =>
        new Router(
          container.get(AuthenticationMiddleware),
          container.get(Services.ControllerResolverInterface),
          container.get(Services.RouteProviderInterface),
        ),
    )

    return container
  }
}
