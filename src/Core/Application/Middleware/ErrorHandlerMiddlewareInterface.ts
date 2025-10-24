import { HttpNextFunction } from '@/Core/Application/Http/HttpNextFunction'
import { HttpRequest } from '@/Core/Application/Http/HttpRequest'
import { HttpResponse } from '@/Core/Application/Http/HttpResponse'

export interface ErrorHandlerMiddlewareInterface {
  handle(
    error: Error,
    request: HttpRequest,
    response: HttpResponse,
    next: HttpNextFunction,
  ): void
}
