import { RouteConfig } from '@/Shared/Application/Router/RouteConfig'
import { RouteProviderInterface } from '@/Shared/Application/Router/RouteProviderInterface'
import { CreateUserController } from '@/User/Infrastructure/CreateUserController'

export class RouteProvider implements RouteProviderInterface {
  getRoutes(): RouteConfig[] {
    return [
      {
        method: 'post',
        path: '/api/v1/user',
        controller: CreateUserController,
        public: true,
      },
    ]
  }
}
