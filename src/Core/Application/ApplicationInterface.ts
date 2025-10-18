export interface ApplicationInterface {
  listen(port: number, callback?: () => void): void
}
