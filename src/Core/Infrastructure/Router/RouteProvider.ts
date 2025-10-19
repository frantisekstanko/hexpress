import { RouteConfig } from '@/Core/Application/Router/RouteConfig'
import { RouteProviderInterface } from '@/Core/Application/Router/RouteProviderInterface'
import { HealthCheckController } from '@/Core/Infrastructure/HealthCheckController'
import { PullDataController } from '@/Core/Infrastructure/PullDataController'

export class RouteProvider implements RouteProviderInterface {
  getRoutes(): RouteConfig[] {
    return [
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
