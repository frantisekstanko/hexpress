import { Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import { LoggerInterface } from '@/Core/Application/LoggerInterface'
import { Symbols } from '@/Core/Application/Symbols'

@injectable()
export class NotFoundMiddleware {
  constructor(
    @inject(Symbols.LoggerInterface) private readonly logger: LoggerInterface,
  ) {}

  public handle(request: Request, response: Response): void {
    this.logger.warning('Route not found', {
      method: request.method,
      path: request.path,
    })

    response.status(404).json({ error: 'Route not found' })
  }
}
