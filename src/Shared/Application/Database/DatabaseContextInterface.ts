import { AsynchronousOperationInterface } from '@/Shared/Application/AsynchronousOperationInterface'
import { DatabaseInterface } from '@/Shared/Application/Database/DatabaseInterface'

export interface DatabaseContextInterface {
  getCurrentDatabase(): DatabaseInterface
  runInContext<Result>(
    database: DatabaseInterface,
    callback: AsynchronousOperationInterface<Result>,
  ): Promise<Result>
}
