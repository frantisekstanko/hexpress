import { RouteConfig } from '@/Core/Application/Router/RouteConfig'

export interface RouteProviderInterface {
  getRoutes(): RouteConfig[]
}
