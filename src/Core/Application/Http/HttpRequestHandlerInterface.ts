import { HttpRequestInterface } from '@/Core/Application/Http/HttpRequestInterface'
import { HttpResponseInterface } from '@/Core/Application/Http/HttpResponseInterface'
import { NextFunctionInterface } from '@/Core/Application/Middleware/NextFunctionInterface'

export type HttpRequestHandlerInterface = (
  request: HttpRequestInterface,
  response: HttpResponseInterface,
  next: NextFunctionInterface,
) => void | Promise<void>
