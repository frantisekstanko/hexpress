import { NextFunction, Request, Response } from 'express'
import { HttpRequestHandlerInterface } from '@/Core/Application/Http/HttpRequestHandlerInterface'
import { HttpRequestInterface } from '@/Core/Application/Http/HttpRequestInterface'
import { HttpResponseInterface } from '@/Core/Application/Http/HttpResponseInterface'
import { NextFunctionInterface } from '@/Core/Application/Http/NextFunctionInterface'
import { AuthenticationMiddlewareInterface } from '@/Core/Application/Middleware/AuthenticationMiddlewareInterface'
import { RouteSecurityPolicyInterface } from '@/Core/Application/Router/RouteSecurityPolicyInterface'

export class AuthenticatedRouteSecurityPolicy
  implements RouteSecurityPolicyInterface
{
  constructor(
    private readonly authenticationMiddleware: AuthenticationMiddlewareInterface,
  ) {}

  getMiddlewares(): HttpRequestHandlerInterface[] {
    return [
      (
        request: HttpRequestInterface,
        response: HttpResponseInterface,
        next: NextFunctionInterface,
      ): void => {
        try {
          this.authenticationMiddleware.authenticate(
            request as Request,
            response as Response,
            next as NextFunction,
          )
        } catch (error: unknown) {
          next(error)
        }
      },
    ]
  }
}
