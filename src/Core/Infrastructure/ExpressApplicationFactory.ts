import express from 'express'
import helmet from 'helmet'
import { ApplicationFactoryInterface } from '@/Core/Application/ApplicationFactoryInterface'
import { ApplicationInterface } from '@/Core/Application/ApplicationInterface'
import { CorsMiddlewareInterface } from '@/Core/Application/Middleware/CorsMiddlewareInterface'
import { ErrorHandlerMiddlewareInterface } from '@/Core/Application/Middleware/ErrorHandlerMiddlewareInterface'
import { NotFoundMiddlewareInterface } from '@/Core/Application/Middleware/NotFoundMiddlewareInterface'
import { TimeoutMiddlewareInterface } from '@/Core/Application/Middleware/TimeoutMiddlewareInterface'
import { RouterInterface } from '@/Core/Infrastructure/Router/RouterInterface'

export class ExpressApplicationFactory implements ApplicationFactoryInterface {
  constructor(
    private readonly corsMiddleware: CorsMiddlewareInterface,
    private readonly timeoutMiddleware: TimeoutMiddlewareInterface,
    private readonly router: RouterInterface,
    private readonly notFoundMiddleware: NotFoundMiddlewareInterface,
    private readonly errorHandler: ErrorHandlerMiddlewareInterface,
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
