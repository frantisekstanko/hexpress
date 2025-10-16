import { AuthenticationMiddleware } from '@/Authentication/Infrastructure/AuthenticationMiddleware'
import { Container } from '@/Core/Infrastructure/Container'
import { ControllerResolver } from '@/Core/Infrastructure/ControllerResolver'
import { RouteProviderChain } from '@/Core/Infrastructure/Router/RouteProviderChain'
import { Router } from '@/Core/Infrastructure/Router/Router'
import { ServiceProviderRegistry } from '@/ServiceProviderRegistry'

export class RouterFactory {
  public static create(
    container: Container,
    registry: ServiceProviderRegistry,
  ): Router {
    const routeProvider = new RouteProviderChain(registry.getServiceProviders())

    const inversifyContainer = container.getInversifyContainer()
    const authenticationMiddleware =
      inversifyContainer.get<AuthenticationMiddleware>(AuthenticationMiddleware)

    const controllerResolver = new ControllerResolver(container)

    return new Router(
      authenticationMiddleware,
      controllerResolver,
      routeProvider,
    )
  }
}
