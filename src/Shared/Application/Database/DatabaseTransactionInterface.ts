import type { DatabaseInterface } from '@/Shared/Application/Database/DatabaseInterface'

export interface DatabaseTransactionInterface extends DatabaseInterface {
  commit(): Promise<void>
  rollback(): Promise<void>
}
