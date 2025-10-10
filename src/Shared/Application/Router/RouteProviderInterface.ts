import { RouteConfig } from '@/Shared/Application/Router/RouteConfig'

export interface RouteProviderInterface {
  getRoutes(): RouteConfig[]
}
