import { ControllerInterface } from '@/Shared/Application/Controller/ControllerInterface'

export type ControllerClassInterface = new (
  ...args: never[]
) => ControllerInterface
