import cors from 'cors'
import { NextFunction, Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import { ConfigInterface } from '@/Core/Application/Config/ConfigInterface'
import { Services } from '@/Core/Application/Services'

@injectable()
export class CorsMiddleware {
  private readonly corsHandler: ReturnType<typeof cors>

  constructor(
    @inject(Services.ConfigInterface) private readonly config: ConfigInterface,
  ) {
    const allowedOrigins = this.config.getAllowedOrigins()

    this.corsHandler = cors({
      origin: (origin, callback) => {
        if (!origin && this.config.isDevelopment()) {
          callback(null, true)
          return
        }

        if (!origin) {
          callback(null, true)
          return
        }

        if (origin && allowedOrigins.includes(origin)) {
          callback(null, true)
          return
        }

        callback(new Error(`Not allowed by CORS: ${origin}`))
      },
      credentials: true,
    })
  }

  public handle(
    request: Request,
    response: Response,
    next: NextFunction,
  ): void {
    this.corsHandler(request, response, next)
  }
}
