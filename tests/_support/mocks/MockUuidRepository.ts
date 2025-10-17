import { UuidRepositoryInterface } from '@/Core/Application/UuidRepositoryInterface'
import { Uuid } from '@/Core/Domain/Uuid'

export class MockUuidRepository implements UuidRepositoryInterface {
  private uuid!: string

  public nextUuid(uuid: string): void {
    this.uuid = uuid
  }

  public getUuid(): Uuid {
    if (!this.uuid) {
      throw new Error('UUID not initialized. Call nextUuid() first.')
    }

    return Uuid.fromString(this.uuid)
  }
}
