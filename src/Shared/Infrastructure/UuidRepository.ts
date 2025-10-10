import { injectable } from 'inversify'
import { v4 as uuidv4 } from 'uuid'
import { UuidRepositoryInterface } from '@/Shared/Application/UuidRepositoryInterface'
import { Uuid } from '@/Shared/Domain/Uuid'

@injectable()
export class UuidRepository implements UuidRepositoryInterface {
  getUuid(): Uuid {
    return Uuid.fromString(uuidv4())
  }
}
