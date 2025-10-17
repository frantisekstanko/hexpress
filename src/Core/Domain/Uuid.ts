import { validate as uuidValidate } from 'uuid'
import { InvalidUuidException } from '@/Core/Domain/InvalidUuidException'

export class Uuid {
  private constructor(private readonly value: string) {
    if (!uuidValidate(value)) {
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
