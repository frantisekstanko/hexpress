import { Constructor } from '@/Core/Application/Constructor'
import { ServiceToken } from '@/Core/Application/ServiceToken'

export interface ContainerInterface {
  registerSingleton<T>(
    identifier: ServiceToken<T>,
    implementation: Constructor<T>,
  ): void

  registerSingletonToSelf<T>(implementation: Constructor<T>): void

  registerTransient<T>(
    identifier: ServiceToken<T>,
    implementation: Constructor<T>,
  ): void

  registerAlias<T>(
    alias: ServiceToken<T>,
    target: ServiceToken<T> | Constructor<T>,
  ): void

  registerConstant<T>(identifier: ServiceToken<T>, value: T): void

  get<T>(identifier: ServiceToken<T> | Constructor<T>): T

  has(identifier: ServiceToken<unknown> | Constructor): boolean
}
