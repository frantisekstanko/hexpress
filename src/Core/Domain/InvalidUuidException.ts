import { ExceptionInterface } from '@/Core/Domain/Exception/ExceptionInterface'

export class InvalidUuidException extends Error implements ExceptionInterface {
  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
  }
}
