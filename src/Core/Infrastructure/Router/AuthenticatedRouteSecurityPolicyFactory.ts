import { AuthenticationMiddlewareInterface } from '@/Core/Application/Middleware/AuthenticationMiddlewareInterface'
import { AuthenticatedRouteSecurityPolicy } from '@/Core/Infrastructure/Router/AuthenticatedRouteSecurityPolicy'

export class AuthenticatedRouteSecurityPolicyFactory {
  constructor(
    private readonly authenticationMiddleware: AuthenticationMiddlewareInterface,
  ) {}

  create(): AuthenticatedRouteSecurityPolicy {
    return new AuthenticatedRouteSecurityPolicy(this.authenticationMiddleware)
  }
}
