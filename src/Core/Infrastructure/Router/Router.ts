import {
  Router as ExpressRouter,
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from 'express'
import { StatusCodes } from 'http-status-codes'
import { inject, injectable } from 'inversify'
import { AuthenticationMiddleware } from '@/Authentication/Infrastructure/AuthenticationMiddleware'
import { ControllerInterface } from '@/Core/Application/Controller/ControllerInterface'
import { ControllerResolverInterface } from '@/Core/Application/Controller/ControllerResolverInterface'
import { RouteProviderInterface } from '@/Core/Application/Router/RouteProviderInterface'
import { Services } from '@/Core/Application/Services'
import { RouterInterface } from '@/Core/Infrastructure/Router/RouterInterface'

@injectable()
export class Router implements RouterInterface {
  private router: ExpressRouter

  constructor(
    @inject(AuthenticationMiddleware)
    private readonly authenticationMiddleware: AuthenticationMiddleware,
    @inject(Services.ControllerResolverInterface)
    private readonly controllerResolver: ControllerResolverInterface,
    @inject(Services.RouteProviderInterface)
    private readonly routeProvider: RouteProviderInterface,
  ) {
    this.authenticationMiddleware = authenticationMiddleware
    this.controllerResolver = controllerResolver
    this.router = ExpressRouter()

    this.registerRoutes()
  }

  private registerRoutes(): void {
    this.routeProvider.getRoutes().forEach((route) => {
      const middlewares = route.public
        ? (route.middlewares ?? [])
        : [
            (req: Request, res: Response, next: NextFunction): void => {
              try {
                this.authenticationMiddleware.authenticate(req, res, next)
              } catch (error: unknown) {
                next(error)
              }
            },
            ...(route.middlewares ?? []),
          ]

      this.addRoute(route.method, route.path, route.controller, middlewares)
    })
  }

  private addRoute(
    method: 'get' | 'post' | 'delete' | 'put' | 'patch',
    path: string,
    controller: new (...args: never[]) => ControllerInterface,
    middlewares: RequestHandler[] = [],
  ): void {
    this.router[method](
      path,
      ...middlewares,
      async (request, response, next) => {
        try {
          const controllerInstance = this.controllerResolver.resolve(controller)
          if (!controllerInstance) {
            response
              .status(StatusCodes.NOT_FOUND)
              .json({ error: 'Controller not registered in the container' })
            return
          }

          await controllerInstance.handle(request, response, next)
        } catch (error: unknown) {
          next(error)
        }
      },
    )
  }

  public getRouter(): ExpressRouter {
    return this.router
  }
}
