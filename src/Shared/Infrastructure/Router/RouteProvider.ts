import { RouteConfig } from '@/Shared/Application/Router/RouteConfig'
import { RouteProviderInterface } from '@/Shared/Application/Router/RouteProviderInterface'
import { HealthCheckController } from '@/Shared/Infrastructure/HealthCheckController'
import { LoginController } from '@/Shared/Infrastructure/LoginController'
import { LogoutController } from '@/Shared/Infrastructure/LogoutController'
import { PullDataController } from '@/Shared/Infrastructure/PullDataController'
import { RefreshTokenController } from '@/Shared/Infrastructure/RefreshTokenController'

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
      {
        method: 'get',
        path: '/health',
        controller: HealthCheckController,
        public: true,
      },
      {
        method: 'get',
        path: '/api/v1/pull',
        controller: PullDataController,
        public: true,
      },
    ]
  }
}
