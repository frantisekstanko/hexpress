import { ConstructorType } from '@/Core/Application/ConstructorType'
import { TypedSymbol } from '@/Core/Application/TypedSymbol'

export interface ContainerInterface {
  registerSingleton<T>(
    identifier: TypedSymbol<T>,
    implementation: ConstructorType<T>,
  ): void

  registerSingletonToSelf<T>(implementation: ConstructorType<T>): void

  registerTransient<T>(
    identifier: TypedSymbol<T>,
    implementation: ConstructorType<T>,
  ): void

  registerAlias<T>(
    alias: TypedSymbol<T>,
    target: TypedSymbol<T> | ConstructorType<T>,
  ): void

  registerConstant<T>(identifier: TypedSymbol<T>, value: T): void

  get<T>(identifier: TypedSymbol<T> | ConstructorType<T>): T

  has(identifier: TypedSymbol<unknown> | ConstructorType): boolean
}
