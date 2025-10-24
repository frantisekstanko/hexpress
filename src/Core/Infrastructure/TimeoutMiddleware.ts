import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ConfigInterface } from '@/Core/Application/Config/ConfigInterface'
import { ConfigOption } from '@/Core/Application/Config/ConfigOption'
import { TimeoutMiddlewareInterface } from '@/Core/Application/Middleware/TimeoutMiddlewareInterface'

export class TimeoutMiddleware implements TimeoutMiddlewareInterface {
  constructor(private readonly config: ConfigInterface) {}

  public handle(
    _request: Request,
    response: Response,
    next: NextFunction,
  ): void {
    response.setTimeout(
      Number(this.config.get(ConfigOption.REQUEST_TIMEOUT_MS)),
      () => {
        response
          .status(StatusCodes.REQUEST_TIMEOUT)
          .json({ error: 'Request timeout' })
        response.end()
      },
    )
    next()
  }
}
