import { HttpRequestHandler } from '@/Core/Application/Http/HttpRequestHandler'

export interface RouteSecurityPolicyInterface {
  getMiddlewares(): HttpRequestHandler[]
}
