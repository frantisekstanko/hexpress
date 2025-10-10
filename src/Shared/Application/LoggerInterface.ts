export interface LoggerInterface {
  info(message: string, context?: Record<string, unknown>): void
  warning(message: string, context?: Record<string, unknown>): void
  error(message: string, error?: unknown): void
  debug(message: string, context?: Record<string, unknown>): void
  close(): void
}
