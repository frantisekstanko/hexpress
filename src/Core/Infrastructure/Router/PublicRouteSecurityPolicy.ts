import { HttpRequestHandlerInterface } from '@/Core/Application/Http/HttpRequestHandlerInterface'
import { RouteSecurityPolicyInterface } from '@/Core/Application/Router/RouteSecurityPolicyInterface'

export class PublicRouteSecurityPolicy implements RouteSecurityPolicyInterface {
  getMiddlewares(): HttpRequestHandlerInterface[] {
    return []
  }
}
