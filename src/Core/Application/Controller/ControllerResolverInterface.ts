import { ControllerClassInterface } from '@/Core/Application/Controller/ControllerClassInterface'
import { ControllerInterface } from '@/Core/Application/Controller/ControllerInterface'

export interface ControllerResolverInterface {
  resolve(controllerClass: ControllerClassInterface): ControllerInterface | null
  has(controllerClass: ControllerClassInterface): boolean
}
