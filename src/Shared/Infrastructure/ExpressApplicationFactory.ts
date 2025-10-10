import express, { Express, NextFunction, Request, Response } from 'express'
import helmet from 'helmet'
import { inject, injectable } from 'inversify'
import { ApplicationFactoryInterface } from '@/Shared/Application/ApplicationFactoryInterface'
import { Symbols } from '@/Shared/Application/Symbols'
import { CorsMiddleware } from '@/Shared/Infrastructure/CorsMiddleware'
import { ErrorHandlerMiddleware } from '@/Shared/Infrastructure/ErrorHandlerMiddleware'
import { NotFoundMiddleware } from '@/Shared/Infrastructure/NotFoundMiddleware'
import { RouterInterface } from '@/Shared/Infrastructure/Router/RouterInterface'
import { TimeoutMiddleware } from '@/Shared/Infrastructure/TimeoutMiddleware'

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

  public create(): Express {
    const app = express()

    app.use(helmet())
    app.use(this.corsMiddleware.create())
    app.use(express.json({ limit: '10mb' }))
    app.use(express.urlencoded({ extended: true, limit: '10mb' }))
    app.use((request: Request, response: Response, next: NextFunction) => {
      this.timeoutMiddleware.handle(request, response, next)
    })
    app.use(this.router.getRouter())
    app.all(/(.*)/, (request: Request, response: Response) => {
      this.notFoundMiddleware.handle(request, response)
    })
    app.use(
      (
        error: Error,
        request: Request,
        response: Response,
        next: NextFunction,
      ) => {
        this.errorHandler.handle(error, request, response, next)
      },
    )

    return app
  }
}
