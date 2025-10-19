import { ContainerInterface } from '@/Core/Application/ContainerInterface'
import { RouteProviderInterface } from '@/Core/Application/Router/RouteProviderInterface'

export interface ServiceProviderInterface extends RouteProviderInterface {
  register(container: ContainerInterface): void
}
