import { AuthenticationMiddleware } from '@/Authentication/Infrastructure/AuthenticationMiddleware'
import { ServiceProviderRegistry } from '@/ServiceProviderRegistry'
import { Container } from '@/Shared/Infrastructure/Container'
import { ControllerResolver } from '@/Shared/Infrastructure/ControllerResolver'
import { RouteProviderChain } from '@/Shared/Infrastructure/Router/RouteProviderChain'
import { Router } from '@/Shared/Infrastructure/Router/Router'

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
