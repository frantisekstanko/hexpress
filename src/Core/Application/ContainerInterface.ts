import { Constructor } from '@/Core/Application/Constructor'
import { ServiceToken } from '@/Core/Application/ServiceToken'

export interface ContainerInterface {
  register<T>(
    identifier: ServiceToken<T> | Constructor<T>,
    factory: (container: ContainerInterface) => T,
  ): void

  get<T>(identifier: ServiceToken<T> | Constructor<T>): T

  has(identifier: ServiceToken<unknown> | Constructor): boolean
}
