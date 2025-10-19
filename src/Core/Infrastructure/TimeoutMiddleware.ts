import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { inject, injectable } from 'inversify'
import { ConfigInterface } from '@/Core/Application/Config/ConfigInterface'
import { ConfigOption } from '@/Core/Application/Config/ConfigOption'
import { Services } from '@/Core/Application/Services'

@injectable()
export class TimeoutMiddleware {
  constructor(
    @inject(Services.ConfigInterface) private readonly config: ConfigInterface,
  ) {}

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
