import { Uuid } from '@/Core/Domain/Uuid'

export class DocumentId {
  private readonly id: Uuid

  constructor(id: Uuid) {
    this.id = id
  }

  public static fromString(id: string): DocumentId {
    return new DocumentId(Uuid.fromString(id))
  }

  public toString(): string {
    return this.id.toString()
  }

  public equals(other: DocumentId): boolean {
    return this.id.equals(other.id)
  }
}
