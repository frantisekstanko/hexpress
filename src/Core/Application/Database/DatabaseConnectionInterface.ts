import { DatabaseInterface } from '@/Core/Application/Database/DatabaseInterface'
import { DatabaseTransactionInterface } from '@/Core/Application/Database/DatabaseTransactionInterface'

export interface DatabaseConnectionInterface extends DatabaseInterface {
  createTransaction(): Promise<DatabaseTransactionInterface>
  close(): Promise<void>
}
