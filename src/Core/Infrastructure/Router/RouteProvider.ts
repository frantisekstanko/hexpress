import { RouteConfig } from '@/Core/Application/Router/RouteConfig'
import { RouteProviderInterface } from '@/Core/Application/Router/RouteProviderInterface'
import { HealthCheckController } from '@/Core/Infrastructure/HealthCheckController'
import { PullDataController } from '@/Core/Infrastructure/PullDataController'
import { PublicRouteSecurityPolicy } from '@/Core/Infrastructure/Router/PublicRouteSecurityPolicy'

export class RouteProvider implements RouteProviderInterface {
  constructor(
    private readonly publicRouteSecurityPolicy: PublicRouteSecurityPolicy,
  ) {}

  getRoutes(): RouteConfig[] {
    return [
      {
        method: 'get',
        path: '/health',
        controller: HealthCheckController,
        securityPolicy: this.publicRouteSecurityPolicy,
      },
      {
        method: 'get',
        path: '/api/v1/pull',
        controller: PullDataController,
        securityPolicy: this.publicRouteSecurityPolicy,
      },
    ]
  }
}
