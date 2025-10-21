import { Uuid } from '@/Core/Domain/Uuid'

export class JwtId {
  private readonly id: Uuid

  constructor(id: Uuid) {
    this.id = id
  }

  public static fromString(id: string): JwtId {
    return new JwtId(Uuid.fromString(id))
  }

  public toString(): string {
    return this.id.toString()
  }

  public equals(other: JwtId): boolean {
    return this.id.equals(other.id)
  }
}
