import { HttpRequestInterface } from '@/Core/Application/Http/HttpRequestInterface'
import { HttpResponseInterface } from '@/Core/Application/Http/HttpResponseInterface'
import { NextFunctionInterface } from '@/Core/Application/Http/NextFunctionInterface'

export interface AuthenticationMiddlewareInterface {
  authenticate(
    request: HttpRequestInterface,
    response: HttpResponseInterface,
    next: NextFunctionInterface,
  ): void
}
