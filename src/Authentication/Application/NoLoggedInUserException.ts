import { ExceptionInterface } from '@/Core/Domain/Exception/ExceptionInterface'

export class NoLoggedInUserException
  extends Error
  implements ExceptionInterface
{
  constructor(message?: string) {
    super(message)
    this.name = 'NoLoggedInUserException'
  }
}
