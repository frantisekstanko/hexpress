import { Uuid } from '@/Core/Domain/Uuid'

export class EventOutboxId {
  private readonly id: Uuid

  constructor(id: Uuid) {
    this.id = id
  }

  public static fromString(id: string): EventOutboxId {
    return new EventOutboxId(Uuid.fromString(id))
  }

  public toString(): string {
    return this.id.toString()
  }

  public equals(other: EventOutboxId): boolean {
    return this.id.equals(other.id)
  }
}
