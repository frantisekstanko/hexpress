import { HttpRequestInterface } from '@/Core/Application/Http/HttpRequestInterface'
import { HttpResponse } from '@/Core/Application/Http/HttpResponse'

export interface NotFoundMiddlewareInterface {
  handle(request: HttpRequestInterface, response: HttpResponse): void
}
