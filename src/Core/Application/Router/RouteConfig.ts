import { ControllerClassInterface } from '@/Core/Application/Controller/ControllerClassInterface'
import { HttpRequestHandler } from '@/Core/Application/Http/HttpRequestHandler'
import { RouteSecurityPolicyInterface } from '@/Core/Application/Router/RouteSecurityPolicyInterface'

export interface RouteConfig {
  method: 'get' | 'post' | 'delete' | 'put' | 'patch'
  path: string
  controller: ControllerClassInterface
  securityPolicy: RouteSecurityPolicyInterface
  middlewares?: HttpRequestHandler[]
}
