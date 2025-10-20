import { HttpNextFunction } from '@/Core/Application/Http/HttpNextFunction'
import { HttpRequest } from '@/Core/Application/Http/HttpRequest'
import { HttpResponse } from '@/Core/Application/Http/HttpResponse'

export interface ControllerInterface<T = HttpRequest> {
  handle(
    request: T,
    response: HttpResponse,
    next: HttpNextFunction,
  ): void | Promise<void>
}
