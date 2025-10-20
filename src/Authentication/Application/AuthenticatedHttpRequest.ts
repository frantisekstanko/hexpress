import { AuthenticatedUser } from '@/Authentication/Application/AuthenticatedUser'
import { HttpRequest } from '@/Core/Application/Http/HttpRequest'

export interface AuthenticatedHttpRequest extends HttpRequest {
  locals: {
    authenticatedUser: AuthenticatedUser
  }
}
