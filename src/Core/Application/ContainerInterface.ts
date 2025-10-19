import { Constructor } from '@/Core/Application/Constructor'
import { TypedSymbol } from '@/Core/Application/TypedSymbol'

export interface ContainerInterface {
  registerSingleton<T>(
    identifier: TypedSymbol<T>,
    implementation: Constructor<T>,
  ): void

  registerSingletonToSelf<T>(implementation: Constructor<T>): void

  registerTransient<T>(
    identifier: TypedSymbol<T>,
    implementation: Constructor<T>,
  ): void

  registerAlias<T>(
    alias: TypedSymbol<T>,
    target: TypedSymbol<T> | Constructor<T>,
  ): void

  registerConstant<T>(identifier: TypedSymbol<T>, value: T): void

  get<T>(identifier: TypedSymbol<T> | Constructor<T>): T

  has(identifier: TypedSymbol<unknown> | Constructor): boolean
}
