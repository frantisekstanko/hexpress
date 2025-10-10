import { AuthenticationMiddleware } from '@/Shared/Infrastructure/AuthenticationMiddleware'
import { Container } from '@/Shared/Infrastructure/Container'
import { ControllerResolver } from '@/Shared/Infrastructure/ControllerResolver'
import { RouteProviderChain } from '@/Shared/Infrastructure/Router/RouteProviderChain'
import { Router } from '@/Shared/Infrastructure/Router/Router'
import { ServiceProviderRegistry } from '@/Shared/Infrastructure/ServiceProviderRegistry'

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
