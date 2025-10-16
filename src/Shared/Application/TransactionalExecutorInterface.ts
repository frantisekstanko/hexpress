import { AsynchronousOperationInterface } from '@/Shared/Application/AsynchronousOperationInterface'

export interface TransactionalExecutorInterface {
  execute<Result>(
    asynchronousOperation: AsynchronousOperationInterface<Result>,
  ): Promise<Result>
}
