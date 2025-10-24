import { HttpRequest } from '@/Core/Application/Http/HttpRequest'
import { HttpResponse } from '@/Core/Application/Http/HttpResponse'

export interface NotFoundMiddlewareInterface {
  handle(request: HttpRequest, response: HttpResponse): void
}
