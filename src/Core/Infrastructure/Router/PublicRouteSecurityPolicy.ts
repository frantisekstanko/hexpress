import { HttpRequestHandler } from '@/Core/Application/Http/HttpRequestHandler'
import { RouteSecurityPolicyInterface } from '@/Core/Application/Router/RouteSecurityPolicyInterface'

export class PublicRouteSecurityPolicy implements RouteSecurityPolicyInterface {
  getMiddlewares(): HttpRequestHandler[] {
    return []
  }
}
