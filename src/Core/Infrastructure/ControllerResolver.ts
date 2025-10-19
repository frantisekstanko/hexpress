import { ControllerClassInterface } from '@/Core/Application/Controller/ControllerClassInterface'
import { ControllerInterface } from '@/Core/Application/Controller/ControllerInterface'
import { ControllerResolverInterface } from '@/Core/Application/Controller/ControllerResolverInterface'
import { Container } from '@/Core/Infrastructure/Container'

export class ControllerResolver implements ControllerResolverInterface {
  constructor(private readonly container: Container) {}

  public resolve(
    controllerClass: ControllerClassInterface,
  ): ControllerInterface | null {
    const controllerSymbol = Symbol.for(controllerClass.name)

    if (!this.container.has(controllerSymbol)) {
      return null
    }

    return this.container.get(controllerSymbol)
  }

  public has(controllerClass: ControllerClassInterface): boolean {
    const controllerSymbol = Symbol.for(controllerClass.name)
    return this.container.has(controllerSymbol)
  }
}
