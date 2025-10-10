import cors from 'cors'
import { inject, injectable } from 'inversify'
import { ConfigInterface } from '@/Shared/Application/Config/ConfigInterface'
import { Symbols } from '@/Shared/Application/Symbols'

@injectable()
export class CorsMiddleware {
  constructor(
    @inject(Symbols.ConfigInterface) private readonly config: ConfigInterface,
  ) {}

  public create() {
    const allowedOrigins = this.config.getAllowedOrigins()

    return cors({
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
}
