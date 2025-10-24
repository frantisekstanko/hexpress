import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { LoggerInterface } from '@/Core/Application/LoggerInterface'
import { NotFoundMiddlewareInterface } from '@/Core/Application/Middleware/NotFoundMiddlewareInterface'

export class NotFoundMiddleware implements NotFoundMiddlewareInterface {
  constructor(private readonly logger: LoggerInterface) {}

  public handle(request: Request, response: Response): void {
    this.logger.warning('Route not found', {
      method: request.method,
      path: request.path,
    })

    response.status(StatusCodes.NOT_FOUND).json({ error: 'Route not found' })
  }
}
