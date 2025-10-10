import { RequestHandler } from 'express'
import { ControllerClassInterface } from '@/Shared/Application/Controller/ControllerClassInterface'

export interface RouteConfig {
  method: 'get' | 'post' | 'delete' | 'put' | 'patch'
  path: string
  controller: ControllerClassInterface
  middlewares?: RequestHandler[]
  public?: boolean
}
