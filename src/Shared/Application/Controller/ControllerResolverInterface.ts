import { ControllerClassInterface } from '@/Shared/Application/Controller/ControllerClassInterface'
import { ControllerInterface } from '@/Shared/Application/Controller/ControllerInterface'

export interface ControllerResolverInterface {
  resolve(controllerClass: ControllerClassInterface): ControllerInterface | null
  has(controllerClass: ControllerClassInterface): boolean
}
