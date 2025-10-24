import { HttpRequest } from '@/Core/Application/Http/HttpRequest'
import { AuthenticatedUser } from '@/Core/Domain/AuthenticatedUser'

export interface AuthenticatedHttpRequest extends HttpRequest {
  locals: {
    authenticatedUser: AuthenticatedUser
  }
}
