import { RouteConfig } from '@/Shared/Application/Router/RouteConfig'
import { RouteProviderInterface } from '@/Shared/Application/Router/RouteProviderInterface'

export class RouteProviderChain implements RouteProviderInterface {
  constructor(private readonly providers: RouteProviderInterface[]) {}

  getRoutes(): RouteConfig[] {
    return this.providers.flatMap((provider) => provider.getRoutes())
  }
}
