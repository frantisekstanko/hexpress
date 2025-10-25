import { HttpRequestInterface } from '@/Core/Application/Http/HttpRequestInterface'
import { AuthenticatedUser } from '@/Core/Domain/AuthenticatedUser'

export interface AuthenticatedHttpRequestInterface
  extends HttpRequestInterface {
  locals: {
    authenticatedUser: AuthenticatedUser
  }
}
