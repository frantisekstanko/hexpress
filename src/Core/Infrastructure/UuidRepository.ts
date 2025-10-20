import { v4 as uuidv4 } from 'uuid'
import { UuidRepositoryInterface } from '@/Core/Application/UuidRepositoryInterface'
import { Uuid } from '@/Core/Domain/Uuid'

export class UuidRepository implements UuidRepositoryInterface {
  getUuid(): Uuid {
    return Uuid.fromString(uuidv4())
  }
}
