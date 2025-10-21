import { RouteConfig } from '@/Core/Application/Router/RouteConfig'
import { RouteProviderInterface } from '@/Core/Application/Router/RouteProviderInterface'
import { PublicRouteSecurityPolicy } from '@/Core/Infrastructure/Router/PublicRouteSecurityPolicy'
import { CreateUserController } from '@/User/Infrastructure/CreateUserController'

export class RouteProvider implements RouteProviderInterface {
  constructor(
    private readonly publicRouteSecurityPolicy: PublicRouteSecurityPolicy,
  ) {}

  getRoutes(): RouteConfig[] {
    return [
      {
        method: 'post',
        path: '/api/v1/user',
        controller: CreateUserController,
        securityPolicy: this.publicRouteSecurityPolicy,
      },
    ]
  }
}
