import { Uuid } from '@/Core/Domain/Uuid'

export interface UuidRepositoryInterface {
  getUuid(): Uuid
}
