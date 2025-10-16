import {
  Router as ExpressRouter,
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from 'express'
import { AuthenticationMiddleware } from '@/Authentication/Infrastructure/AuthenticationMiddleware'
import { ControllerInterface } from '@/Shared/Application/Controller/ControllerInterface'
import { ControllerResolverInterface } from '@/Shared/Application/Controller/ControllerResolverInterface'
import { RouteConfig } from '@/Shared/Application/Router/RouteConfig'
import { RouteProviderInterface } from '@/Shared/Application/Router/RouteProviderInterface'
import { RouterInterface } from '@/Shared/Infrastructure/Router/RouterInterface'

export class Router implements RouterInterface {
  private router: ExpressRouter
  private routes: RouteConfig[]

  constructor(
    authenticationMiddleware: AuthenticationMiddleware,
    controllerResolver: ControllerResolverInterface,
    routeProvider: RouteProviderInterface,
  ) {
    this.authenticationMiddleware = authenticationMiddleware
    this.controllerResolver = controllerResolver
    this.router = ExpressRouter()

    this.routes = routeProvider.getRoutes()

    this.registerRoutes()
  }

  private readonly authenticationMiddleware: AuthenticationMiddleware
  private readonly controllerResolver: ControllerResolverInterface

  private registerRoutes(): void {
    this.routes.forEach((route) => {
      const middlewares = route.public
        ? (route.middlewares ?? [])
        : [
            (req: Request, res: Response, next: NextFunction): void => {
              this.authenticationMiddleware
                .authenticate(req, res, next)
                .catch((error: unknown) => {
                  next(error)
                })
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
          if (!this.controllerResolver.has(controller)) {
            response
              .status(404)
              .json({ error: 'Controller not registered in the container' })
            return
          }

          const controllerInstance = this.controllerResolver.resolve(controller)
          if (!controllerInstance) {
            response
              .status(404)
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
