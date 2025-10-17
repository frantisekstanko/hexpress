export class AllowedOrigins {
  private readonly origins: string[]

  private constructor(origins: string[]) {
    this.origins = origins
  }

  public static fromCommaSeparatedString(value: string): AllowedOrigins {
    const origins = value.split(',').map((origin) => origin.trim())
    return new AllowedOrigins(origins)
  }

  public includes(origin: string): boolean {
    return this.origins.includes(origin)
  }

  public toArray(): string[] {
    return [...this.origins]
  }
}
