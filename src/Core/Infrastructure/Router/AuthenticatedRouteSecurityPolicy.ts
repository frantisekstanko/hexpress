import { NextFunction, Request, Response } from 'express'
import { AuthenticationMiddleware } from '@/Authentication/Infrastructure/AuthenticationMiddleware'
import { HttpNextFunction } from '@/Core/Application/Http/HttpNextFunction'
import { HttpRequest } from '@/Core/Application/Http/HttpRequest'
import { HttpRequestHandler } from '@/Core/Application/Http/HttpRequestHandler'
import { HttpResponse } from '@/Core/Application/Http/HttpResponse'
import { RouteSecurityPolicyInterface } from '@/Core/Application/Router/RouteSecurityPolicyInterface'

export class AuthenticatedRouteSecurityPolicy
  implements RouteSecurityPolicyInterface
{
  constructor(
    private readonly authenticationMiddleware: AuthenticationMiddleware,
  ) {}

  getMiddlewares(): HttpRequestHandler[] {
    return [
      (
        request: HttpRequest,
        response: HttpResponse,
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
