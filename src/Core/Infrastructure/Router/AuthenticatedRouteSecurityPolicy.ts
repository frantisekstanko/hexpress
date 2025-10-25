import { NextFunction, Request, Response } from 'express'
import { HttpNextFunction } from '@/Core/Application/Http/HttpNextFunction'
import { HttpRequestHandler } from '@/Core/Application/Http/HttpRequestHandler'
import { HttpRequestInterface } from '@/Core/Application/Http/HttpRequestInterface'
import { HttpResponseInterface } from '@/Core/Application/Http/HttpResponseInterface'
import { AuthenticationMiddlewareInterface } from '@/Core/Application/Middleware/AuthenticationMiddlewareInterface'
import { RouteSecurityPolicyInterface } from '@/Core/Application/Router/RouteSecurityPolicyInterface'

export class AuthenticatedRouteSecurityPolicy
  implements RouteSecurityPolicyInterface
{
  constructor(
    private readonly authenticationMiddleware: AuthenticationMiddlewareInterface,
  ) {}

  getMiddlewares(): HttpRequestHandler[] {
    return [
      (
        request: HttpRequestInterface,
        response: HttpResponseInterface,
        next: HttpNextFunction,
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
