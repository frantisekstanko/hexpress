import { HttpNextFunction } from '@/Core/Application/Http/HttpNextFunction'
import { HttpRequestInterface } from '@/Core/Application/Http/HttpRequestInterface'
import { HttpResponseInterface } from '@/Core/Application/Http/HttpResponseInterface'

export interface TimeoutMiddlewareInterface {
  handle(
    request: HttpRequestInterface,
    response: HttpResponseInterface,
    next: HttpNextFunction,
  ): void
}
