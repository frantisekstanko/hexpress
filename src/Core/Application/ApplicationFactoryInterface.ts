import { ApplicationInterface } from '@/Core/Application/ApplicationInterface'

export interface ApplicationFactoryInterface {
  create(): ApplicationInterface
}
