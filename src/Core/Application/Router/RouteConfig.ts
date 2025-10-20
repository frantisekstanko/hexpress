import { ControllerClassInterface } from '@/Core/Application/Controller/ControllerClassInterface'
import { HttpRequestHandler } from '@/Core/Application/Http/HttpRequestHandler'

export interface RouteConfig {
  method: 'get' | 'post' | 'delete' | 'put' | 'patch'
  path: string
  controller: ControllerClassInterface
  middlewares?: HttpRequestHandler[]
  public?: boolean
}
