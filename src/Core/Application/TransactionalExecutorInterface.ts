import { AsynchronousOperationInterface } from '@/Core/Application/AsynchronousOperationInterface'

export interface TransactionalExecutorInterface {
  execute<Result>(
    asynchronousOperation: AsynchronousOperationInterface<Result>,
  ): Promise<Result>
}
