import { Uuid } from '@/Core/Domain/Uuid'

export class DocumentId {
  private readonly id: Uuid

  constructor(id: Uuid) {
    this.id = id
  }

  public static fromString(id: string) {
    return new DocumentId(Uuid.fromString(id))
  }

  public toString() {
    return this.id.toString()
  }
}
