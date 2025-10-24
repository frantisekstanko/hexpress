import { ContainerInterface } from '@/Core/Application/ContainerInterface'
import { Services } from '@/Core/Application/Services'
import { CorsMiddleware } from '@/Core/Infrastructure/CorsMiddleware'
import { ErrorHandlerMiddleware } from '@/Core/Infrastructure/ErrorHandlerMiddleware'
import { ExpressApplicationFactory } from '@/Core/Infrastructure/ExpressApplicationFactory'
import { HealthCheckController } from '@/Core/Infrastructure/HealthCheckController'
import { NotFoundMiddleware } from '@/Core/Infrastructure/NotFoundMiddleware'
import { PullDataController } from '@/Core/Infrastructure/PullDataController'
import { TimeoutMiddleware } from '@/Core/Infrastructure/TimeoutMiddleware'

export class HttpServiceProvider {
  register(container: ContainerInterface): void {
    container.register(
      Symbol.for(PullDataController.name),
      (container) =>
        new PullDataController(
          container.get(Services.ApplicationVersionRepositoryInterface),
        ),
    )

    container.register(
      Symbol.for(HealthCheckController.name),
      (container) =>
        new HealthCheckController(
          container.get(Services.DatabaseContextInterface),
          container.get(Services.ConfigInterface),
        ),
    )

    container.register(
      Services.ErrorHandlerMiddlewareInterface,
      (container) =>
        new ErrorHandlerMiddleware(container.get(Services.LoggerInterface)),
    )

    container.register(
      Services.CorsMiddlewareInterface,
      (container) =>
        new CorsMiddleware(container.get(Services.ConfigInterface)),
    )

    container.register(
      Services.TimeoutMiddlewareInterface,
      (container) =>
        new TimeoutMiddleware(container.get(Services.ConfigInterface)),
    )

    container.register(
      Services.NotFoundMiddlewareInterface,
      (container) =>
        new NotFoundMiddleware(container.get(Services.LoggerInterface)),
    )

    container.register(
      Services.ApplicationFactoryInterface,
      (container) =>
        new ExpressApplicationFactory(
          container.get(Services.CorsMiddlewareInterface),
          container.get(Services.TimeoutMiddlewareInterface),
          container.get(Symbol.for('RouterInterface')),
          container.get(Services.NotFoundMiddlewareInterface),
          container.get(Services.ErrorHandlerMiddlewareInterface),
        ),
    )
  }
}
