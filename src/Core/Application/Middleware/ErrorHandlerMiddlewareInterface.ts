import { HttpNextFunction } from '@/Core/Application/Http/HttpNextFunction'
import { HttpRequestInterface } from '@/Core/Application/Http/HttpRequestInterface'
import { HttpResponseInterface } from '@/Core/Application/Http/HttpResponseInterface'

export interface ErrorHandlerMiddlewareInterface {
  handle(
    error: Error,
    request: HttpRequestInterface,
    response: HttpResponseInterface,
    next: HttpNextFunction,
  ): void
}
