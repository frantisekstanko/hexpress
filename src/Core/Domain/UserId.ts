import { Uuid } from '@/Core/Domain/Uuid'

export class UserId {
  private id: Uuid

  constructor(id: Uuid) {
    this.id = id
  }

  public static fromString(id: string) {
    return new UserId(Uuid.fromString(id))
  }

  public toString() {
    return this.id.toString()
  }
}
