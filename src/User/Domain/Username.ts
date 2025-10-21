import { InvalidUsernameException } from '@/User/Domain/InvalidUsernameException'

export class Username {
  private readonly value: string

  private constructor(value: string) {
    const trimmed = value.trim()

    if (trimmed.length === 0) {
      throw new InvalidUsernameException('Username must not be empty')
    }

    this.value = trimmed
  }

  public static fromString(value: string): Username {
    return new Username(value)
  }

  public toString(): string {
    return this.value
  }

  public equals(other: Username): boolean {
    return this.value === other.value
  }
}
