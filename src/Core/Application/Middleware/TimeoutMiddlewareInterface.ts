import { HttpNextFunction } from '@/Core/Application/Http/HttpNextFunction'
import { HttpRequest } from '@/Core/Application/Http/HttpRequest'
import { HttpResponse } from '@/Core/Application/Http/HttpResponse'

export interface TimeoutMiddlewareInterface {
  handle(
    request: HttpRequest,
    response: HttpResponse,
    next: HttpNextFunction,
  ): void
}
