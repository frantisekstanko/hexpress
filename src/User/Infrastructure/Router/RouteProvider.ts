import { RouteConfig } from '@/Core/Application/Router/RouteConfig'
import { RouteProviderInterface } from '@/Core/Application/Router/RouteProviderInterface'
import { PublicRouteSecurityPolicy } from '@/Core/Infrastructure/Router/PublicRouteSecurityPolicy'
import { CreateUserController } from '@/User/Infrastructure/CreateUserController'
import { LoginController } from '@/User/Infrastructure/LoginController'
import { LogoutController } from '@/User/Infrastructure/LogoutController'
import { RefreshTokenController } from '@/User/Infrastructure/RefreshTokenController'

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
