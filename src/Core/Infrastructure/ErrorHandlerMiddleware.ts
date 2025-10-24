import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { LoggerInterface } from '@/Core/Application/LoggerInterface'
import { ErrorHandlerMiddlewareInterface } from '@/Core/Application/Middleware/ErrorHandlerMiddlewareInterface'
import { NotFoundException } from '@/Core/Domain/Exception/NotFoundException'
import { RuntimeException } from '@/Core/Domain/Exception/RuntimeException'

export class ErrorHandlerMiddleware implements ErrorHandlerMiddlewareInterface {
  constructor(private readonly logger: LoggerInterface) {}

  public handle(
    error: Error,
    request: Request,
    response: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction,
  ): void {
    if (error instanceof NotFoundException) {
      this.logger.info('Resource not found', {
        message: error.message,
        path: request.path,
        method: request.method,
      })

      response.status(StatusCodes.NOT_FOUND)
      return
    }

    if (error instanceof RuntimeException) {
      this.logger.error('Runtime error occurred', {
        error: error,
        message: error.message,
        stack: error.stack,
        path: request.path,
        method: request.method,
      })

      response.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR)
      return
    }

    this.logger.error('Unhandled error occurred', {
      error: error,
      message: error.message,
      stack: error.stack,
      path: request.path,
      method: request.method,
    })

    response.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR)
  }
}
