import { AsynchronousOperationInterface } from '@/Core/Application/AsynchronousOperationInterface'
import { DatabaseInterface } from '@/Core/Application/Database/DatabaseInterface'

export interface DatabaseContextInterface {
  getCurrentDatabase(): DatabaseInterface
  runInContext<Result>(
    database: DatabaseInterface,
    asynchronousOperation: AsynchronousOperationInterface<Result>,
  ): Promise<Result>
}
