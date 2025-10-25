import { HttpNextFunction } from '@/Core/Application/Http/HttpNextFunction'
import { HttpRequestInterface } from '@/Core/Application/Http/HttpRequestInterface'
import { HttpResponse } from '@/Core/Application/Http/HttpResponse'

export type HttpRequestHandler = (
  request: HttpRequestInterface,
  response: HttpResponse,
  next: HttpNextFunction,
) => void | Promise<void>
