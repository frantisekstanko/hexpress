import { HttpNextFunction } from '@/Core/Application/Http/HttpNextFunction'
import { HttpRequestInterface } from '@/Core/Application/Http/HttpRequestInterface'
import { HttpResponse } from '@/Core/Application/Http/HttpResponse'

export interface ControllerInterface<T = HttpRequestInterface> {
  handle(
    request: T,
    response: HttpResponse,
    next: HttpNextFunction,
  ): void | Promise<void>
}
