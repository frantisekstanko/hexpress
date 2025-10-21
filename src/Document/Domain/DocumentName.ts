import { InvalidDocumentNameException } from '@/Document/Domain/InvalidDocumentNameException'

export class DocumentName {
  private readonly value: string

  private constructor(value: string) {
    const trimmed = value.trim()

    if (trimmed.length === 0) {
      throw new InvalidDocumentNameException('Document name must not be empty')
    }

    this.value = trimmed
  }

  public static fromString(value: string): DocumentName {
    return new DocumentName(value)
  }

  public toString(): string {
    return this.value
  }

  public equals(other: DocumentName): boolean {
    return this.value === other.value
  }
}
