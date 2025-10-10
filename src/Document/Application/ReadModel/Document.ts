export class Document {
  private readonly id: string
  private readonly name: string

  constructor({ id, name }: { id: string; name: string }) {
    this.id = id
    this.name = name
  }

  public getDocumentId(): string {
    return this.id
  }

  public getDocumentName(): string {
    return this.name
  }
}
