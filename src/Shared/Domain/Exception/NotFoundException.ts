import { ExceptionInterface } from '@/Shared/Domain/Exception/ExceptionInterface'

export class NotFoundException extends Error implements ExceptionInterface {
  constructor(message: string) {
    super(message)
    this.name = 'NotFoundException'
  }
}
