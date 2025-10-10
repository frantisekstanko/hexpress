export class ErrorResponse {
  public readonly error: string
  public readonly code?: string
  public readonly errors?: Record<string, string[]>

  constructor(args: {
    error: string
    code?: string
    errors?: Record<string, string[]>
  }) {
    this.error = args.error
    this.code = args.code
    this.errors = args.errors
  }

  public toJSON(): Record<string, unknown> {
    const result: Record<string, unknown> = {
      error: this.error,
    }

    if (this.code !== undefined) {
      result.code = this.code
    }

    if (this.errors !== undefined) {
      result.errors = this.errors
    }

    return result
  }
}
