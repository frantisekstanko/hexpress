import { LoginController } from '@/Authentication/Infrastructure/LoginController'
import { LogoutController } from '@/Authentication/Infrastructure/LogoutController'
import { RefreshTokenController } from '@/Authentication/Infrastructure/RefreshTokenController'
import { RouteConfig } from '@/Core/Application/Router/RouteConfig'
import { RouteProviderInterface } from '@/Core/Application/Router/RouteProviderInterface'
import { PublicRouteSecurityPolicy } from '@/Core/Infrastructure/Router/PublicRouteSecurityPolicy'

export class RouteProvider implements RouteProviderInterface {
  constructor(
    private readonly publicRouteSecurityPolicy: PublicRouteSecurityPolicy,
  ) {}

  getRoutes(): RouteConfig[] {
    return [
      {
        method: 'post',
        path: '/api/v1/login',
        controller: LoginController,
        securityPolicy: this.publicRouteSecurityPolicy,
      },
      {
        method: 'post',
        path: '/api/v1/logout',
        controller: LogoutController,
        securityPolicy: this.publicRouteSecurityPolicy,
      },
      {
        method: 'post',
        path: '/api/v1/refresh-token',
        controller: RefreshTokenController,
        securityPolicy: this.publicRouteSecurityPolicy,
      },
    ]
  }
}
