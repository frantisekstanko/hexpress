import { NextFunction, Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import { ConfigInterface } from '@/Shared/Application/Config/ConfigInterface'
import { ConfigOption } from '@/Shared/Application/Config/ConfigOption'
import { Symbols } from '@/Shared/Application/Symbols'

@injectable()
export class TimeoutMiddleware {
  constructor(
    @inject(Symbols.ConfigInterface) private readonly config: ConfigInterface,
  ) {}

  public handle(
    _request: Request,
    response: Response,
    next: NextFunction,
  ): void {
    response.setTimeout(
      Number(this.config.get(ConfigOption.REQUEST_TIMEOUT_MS)),
      () => {
        response.status(408).json({ error: 'Request timeout' })
        response.end()
      },
    )
    next()
  }
}
