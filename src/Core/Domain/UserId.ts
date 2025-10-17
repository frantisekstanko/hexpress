import { Uuid } from '@/Core/Domain/Uuid'

export class UserId {
  private readonly id: Uuid

  constructor(id: Uuid) {
    this.id = id
  }

  public static fromString(id: string): UserId {
    return new UserId(Uuid.fromString(id))
  }

  public toString(): string {
    return this.id.toString()
  }

  public equals(other: UserId): boolean {
    return this.id.equals(other.id)
  }
}
