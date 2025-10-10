import { ControllerClassInterface } from '@/Shared/Application/Controller/ControllerClassInterface'
import { ControllerInterface } from '@/Shared/Application/Controller/ControllerInterface'
import { ControllerResolverInterface } from '@/Shared/Application/Controller/ControllerResolverInterface'
import { Container } from '@/Shared/Infrastructure/Container'

export class ControllerResolver implements ControllerResolverInterface {
  constructor(private readonly container: Container) {}

  public resolve(
    controllerClass: ControllerClassInterface,
  ): ControllerInterface | null {
    const controllerSymbol = Symbol.for(controllerClass.name)

    if (!this.container.has(controllerSymbol)) {
      return null
    }

    return this.container.get<ControllerInterface>(controllerSymbol)
  }

  public has(controllerClass: ControllerClassInterface): boolean {
    const controllerSymbol = Symbol.for(controllerClass.name)
    return this.container.has(controllerSymbol)
  }
}
