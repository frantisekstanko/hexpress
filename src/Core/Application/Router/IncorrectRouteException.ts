import { ExceptionInterface } from '@/Core/Domain/Exception/ExceptionInterface'

export class IncorrectRouteException
  extends Error
  implements ExceptionInterface
{
  constructor(message: string) {
    super(message)
    this.name = 'IncorrectRouteException'
  }
}
