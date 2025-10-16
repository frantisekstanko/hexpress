import { Container as InversifyContainer } from 'inversify'
import { RouteProviderInterface } from '@/Core/Application/Router/RouteProviderInterface'

export interface ServiceProviderInterface extends RouteProviderInterface {
  register(container: InversifyContainer): void
}
