import { ControllerInterface } from '@/Core/Application/Controller/ControllerInterface'

export type ControllerClassInterface = new (
  ...args: never[]
) => ControllerInterface
