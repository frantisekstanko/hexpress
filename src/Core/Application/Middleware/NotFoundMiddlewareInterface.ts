import { HttpRequestInterface } from '@/Core/Application/Http/HttpRequestInterface'
import { HttpResponseInterface } from '@/Core/Application/Http/HttpResponseInterface'

export interface NotFoundMiddlewareInterface {
  handle(request: HttpRequestInterface, response: HttpResponseInterface): void
}
