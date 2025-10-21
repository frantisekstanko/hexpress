export class HashedPassword {
  private readonly value: string

  private constructor(value: string) {
    this.value = value
  }

  public static fromString(value: string): HashedPassword {
    return new HashedPassword(value)
  }

  public toString(): string {
    return this.value
  }

  public equals(other: HashedPassword): boolean {
    return this.value === other.value
  }
}
