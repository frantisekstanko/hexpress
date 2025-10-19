import { LoginController } from '@/Authentication/Infrastructure/LoginController'
import { LogoutController } from '@/Authentication/Infrastructure/LogoutController'
import { RefreshTokenController } from '@/Authentication/Infrastructure/RefreshTokenController'
import { RouteConfig } from '@/Core/Application/Router/RouteConfig'
import { RouteProviderInterface } from '@/Core/Application/Router/RouteProviderInterface'

export class RouteProvider implements RouteProviderInterface {
  getRoutes(): RouteConfig[] {
    return [
      {
        method: 'post',
        path: '/api/v1/login',
        controller: LoginController,
        public: true,
      },
      {
        method: 'post',
        path: '/api/v1/logout',
        controller: LogoutController,
        public: true,
      },
      {
        method: 'post',
        path: '/api/v1/refresh-token',
        controller: RefreshTokenController,
        public: true,
      },
    ]
  }
}
