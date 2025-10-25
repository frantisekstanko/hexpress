export interface HttpRequestInterface {
  body: unknown
  params: Record<string, string>
  query: Record<string, unknown>
  headers: Record<string, string | string[] | undefined>
  method: string
  path: string
}
