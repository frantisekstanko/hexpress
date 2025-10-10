import { DatabaseInterface } from '@/Shared/Application/Database/DatabaseInterface'
import { DatabaseTransactionInterface } from '@/Shared/Application/Database/DatabaseTransactionInterface'

export interface DatabaseConnectionInterface extends DatabaseInterface {
  createTransaction(): Promise<DatabaseTransactionInterface>
  close(): Promise<void>
}
