import { UuidRepositoryInterface } from '@/Shared/Application/UuidRepositoryInterface'
import { Uuid } from '@/Shared/Domain/Uuid'

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
