export interface HttpResponseInterface {
  status(code: number): HttpResponseInterface
  json(data: unknown): HttpResponseInterface
  send(data: unknown): HttpResponseInterface
  setHeader(name: string, value: string): HttpResponseInterface
}
