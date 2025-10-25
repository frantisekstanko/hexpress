import { ControllerClassInterface } from '@/Core/Application/Controller/ControllerClassInterface'
import { HttpRequestHandlerInterface } from '@/Core/Application/Http/HttpRequestHandlerInterface'
import { RouteSecurityPolicyInterface } from '@/Core/Application/Router/RouteSecurityPolicyInterface'

export interface RouteConfig {
  method: 'get' | 'post' | 'delete' | 'put' | 'patch'
  path: string
  controller: ControllerClassInterface
  securityPolicy: RouteSecurityPolicyInterface
  middlewares?: HttpRequestHandlerInterface[]
}
