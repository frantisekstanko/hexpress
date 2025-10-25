import { HttpRequestInterface } from '@/Core/Application/Http/HttpRequestInterface'
import { AuthenticatedUser } from '@/Core/Domain/AuthenticatedUser'

export interface AuthenticatedHttpRequest extends HttpRequestInterface {
  locals: {
    authenticatedUser: AuthenticatedUser
  }
}
