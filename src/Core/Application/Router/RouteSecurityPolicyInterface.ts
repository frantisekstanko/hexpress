import { HttpRequestHandlerInterface } from '@/Core/Application/Http/HttpRequestHandlerInterface'

export interface RouteSecurityPolicyInterface {
  getMiddlewares(): HttpRequestHandlerInterface[]
}
