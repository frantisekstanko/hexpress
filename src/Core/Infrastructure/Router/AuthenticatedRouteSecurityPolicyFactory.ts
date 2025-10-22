import { AuthenticationMiddleware } from '@/Authentication/Infrastructure/AuthenticationMiddleware'
import { AuthenticatedRouteSecurityPolicy } from '@/Core/Infrastructure/Router/AuthenticatedRouteSecurityPolicy'

export class AuthenticatedRouteSecurityPolicyFactory {
  constructor(
    private readonly authenticationMiddleware: AuthenticationMiddleware,
  ) {}

  create(): AuthenticatedRouteSecurityPolicy {
    return new AuthenticatedRouteSecurityPolicy(this.authenticationMiddleware)
  }
}
