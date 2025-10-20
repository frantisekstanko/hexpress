import { InvalidUuidException } from '@/Core/Domain/InvalidUuidException'

export class Uuid {
  private static readonly UUID_PATTERN =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

  private constructor(private readonly value: string) {
    if (!Uuid.UUID_PATTERN.test(value)) {
      throw new InvalidUuidException(`Invalid UUID: ${value}`)
    }
  }

  public static fromString(value: string): Uuid {
    return new Uuid(value.toLowerCase())
  }

  public toString(): string {
    return this.value
  }

  public equals(other: Uuid): boolean {
    return this.value === other.value
  }
}
