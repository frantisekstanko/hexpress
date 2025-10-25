import { HttpRequestInterface } from '@/Core/Application/Http/HttpRequestInterface'
import { HttpResponseInterface } from '@/Core/Application/Http/HttpResponseInterface'
import { NextFunctionInterface } from '@/Core/Application/Http/NextFunctionInterface'

export interface ControllerInterface<T = HttpRequestInterface> {
  handle(
    request: T,
    response: HttpResponseInterface,
    next: NextFunctionInterface,
  ): void | Promise<void>
}
