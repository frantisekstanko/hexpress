import { AsynchronousOperationInterface } from '@/Shared/Application/AsynchronousOperationInterface'
import { DatabaseInterface } from '@/Shared/Application/Database/DatabaseInterface'

export interface DatabaseContextInterface {
  getCurrentDatabase(): DatabaseInterface
  runInContext<Result>(
    database: DatabaseInterface,
    asynchronousOperation: AsynchronousOperationInterface<Result>,
  ): Promise<Result>
}
