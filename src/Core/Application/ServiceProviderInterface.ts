import { ContainerInterface } from '@/Core/Application/ContainerInterface'

export interface ServiceProviderInterface {
  register(container: ContainerInterface): void
}
