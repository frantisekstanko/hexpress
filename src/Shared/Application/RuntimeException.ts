import { ExceptionInterface } from '@/Shared/Domain/Exception/ExceptionInterface'

export class RuntimeException extends Error implements ExceptionInterface {
  constructor(message?: string) {
    super(message)
    this.name = 'RuntimeException'
  }
}
