import { Router as ExpressRouter, RequestHandler } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ControllerInterface } from '@/Core/Application/Controller/ControllerInterface'
import { ControllerResolverInterface } from '@/Core/Application/Controller/ControllerResolverInterface'
import { RouteProviderInterface } from '@/Core/Application/Router/RouteProviderInterface'
import { RouterInterface } from '@/Core/Infrastructure/Router/RouterInterface'

export class Router implements RouterInterface {
  private router: ExpressRouter

  constructor(
    private readonly controllerResolver: ControllerResolverInterface,
    private readonly routeProvider: RouteProviderInterface,
  ) {
    this.router = ExpressRouter()

    this.registerRoutes()
  }

  private registerRoutes(): void {
    this.routeProvider.getRoutes().forEach((route) => {
      const middlewares = [
        ...route.securityPolicy.getMiddlewares(),
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
