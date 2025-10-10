import { Uuid } from '@/Shared/Domain/Uuid'

export interface UuidRepositoryInterface {
  getUuid(): Uuid
}
