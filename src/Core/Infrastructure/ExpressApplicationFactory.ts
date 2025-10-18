import express from 'express'
import helmet from 'helmet'
import { inject, injectable } from 'inversify'
import { ApplicationFactoryInterface } from '@/Core/Application/ApplicationFactoryInterface'
import { ApplicationInterface } from '@/Core/Application/ApplicationInterface'
import { Symbols } from '@/Core/Application/Symbols'
import { CorsMiddleware } from '@/Core/Infrastructure/CorsMiddleware'
import { ErrorHandlerMiddleware } from '@/Core/Infrastructure/ErrorHandlerMiddleware'
import { NotFoundMiddleware } from '@/Core/Infrastructure/NotFoundMiddleware'
import { RouterInterface } from '@/Core/Infrastructure/Router/RouterInterface'
import { TimeoutMiddleware } from '@/Core/Infrastructure/TimeoutMiddleware'

@injectable()
export class ExpressApplicationFactory implements ApplicationFactoryInterface {
  constructor(
    @inject(Symbols.CorsMiddleware)
    private readonly corsMiddleware: CorsMiddleware,
    @inject(Symbols.TimeoutMiddleware)
    private readonly timeoutMiddleware: TimeoutMiddleware,
    @inject(Symbols.RouterInterface) private readonly router: RouterInterface,
    @inject(Symbols.NotFoundMiddleware)
    private readonly notFoundMiddleware: NotFoundMiddleware,
    @inject(Symbols.ErrorHandlerMiddleware)
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
