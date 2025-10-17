import type { DatabaseInterface } from '@/Core/Application/Database/DatabaseInterface'

export interface DatabaseTransactionInterface extends DatabaseInterface {
  commit(): Promise<void>
  rollback(): Promise<void>
}
