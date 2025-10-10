import { ApplicationInterface } from '@/Shared/Application/ApplicationInterface'

export interface ApplicationFactoryInterface {
  create(): ApplicationInterface
}
