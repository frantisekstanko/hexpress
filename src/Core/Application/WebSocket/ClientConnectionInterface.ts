export interface ClientConnectionInterface {
  send(message: string): void
  close(): void
}
