import { HttpNextFunction } from '@/Core/Application/Http/HttpNextFunction'
import { HttpRequestInterface } from '@/Core/Application/Http/HttpRequestInterface'
import { HttpResponseInterface } from '@/Core/Application/Http/HttpResponseInterface'

export interface ControllerInterface<T = HttpRequestInterface> {
  handle(
    request: T,
    response: HttpResponseInterface,
    next: HttpNextFunction,
  ): void | Promise<void>
}
