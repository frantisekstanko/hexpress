import express from 'express'
import helmet from 'helmet'
import { ApplicationFactoryInterface } from '@/Core/Application/ApplicationFactoryInterface'
import { ApplicationInterface } from '@/Core/Application/ApplicationInterface'
import { CorsMiddleware } from '@/Core/Infrastructure/CorsMiddleware'
import { ErrorHandlerMiddleware } from '@/Core/Infrastructure/ErrorHandlerMiddleware'
import { NotFoundMiddleware } from '@/Core/Infrastructure/NotFoundMiddleware'
import { RouterInterface } from '@/Core/Infrastructure/Router/RouterInterface'
import { TimeoutMiddleware } from '@/Core/Infrastructure/TimeoutMiddleware'

export class ExpressApplicationFactory implements ApplicationFactoryInterface {
  constructor(
    private readonly corsMiddleware: CorsMiddleware,
    private readonly timeoutMiddleware: TimeoutMiddleware,
    private readonly router: RouterInterface,
    private readonly notFoundMiddleware: NotFoundMiddleware,
    private readonly errorHandler: ErrorHandlerMiddleware,
  ) {}

  public create(): ApplicationInterface {
    const app = express()

    app.use(helmet())
    app.use(this.corsMiddleware.handle.bind(this.corsMiddleware))
    app.use(express.json({ limit: '10mb' }))
    app.use(express.urlencoded({ extended: true, limit: '10mb' }))
    app.use(this.timeoutMiddleware.handle.bind(this.timeoutMiddleware))
    app.use(this.router.getRouter())
    app.all(
      /(.*)/,
      this.notFoundMiddleware.handle.bind(this.notFoundMiddleware),
    )
    app.use(this.errorHandler.handle.bind(this.errorHandler))

    return app
  }
}
