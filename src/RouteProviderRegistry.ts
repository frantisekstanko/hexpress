import { ContainerInterface } from '@/Core/Application/ContainerInterface'
import { RouteProviderInterface } from '@/Core/Application/Router/RouteProviderInterface'
import { AuthenticatedRouteSecurityPolicyFactory } from '@/Core/Infrastructure/Router/AuthenticatedRouteSecurityPolicyFactory'
import { PublicRouteSecurityPolicy } from '@/Core/Infrastructure/Router/PublicRouteSecurityPolicy'
import { RouteProvider as CoreRouteProvider } from '@/Core/Infrastructure/Router/RouteProvider'
import { RouteProvider as DocumentRouteProvider } from '@/Document/Infrastructure/Router/RouteProvider'
import { RouteProvider as UserRouteProvider } from '@/User/Infrastructure/Router/RouteProvider'

export class RouteProviderRegistry {
  private readonly routeProviders: RouteProviderInterface[]

  constructor(container: ContainerInterface) {
    const publicPolicy = new PublicRouteSecurityPolicy()
    const authenticatedPolicyFactory =
      container.get<AuthenticatedRouteSecurityPolicyFactory>(
        AuthenticatedRouteSecurityPolicyFactory,
      )

    this.routeProviders = [
      new CoreRouteProvider(publicPolicy),
      new UserRouteProvider(publicPolicy),
      new DocumentRouteProvider(authenticatedPolicyFactory.create()),
    ]
  }

  public getRouteProviders(): RouteProviderInterface[] {
    return this.routeProviders
  }
}
