import { AsynchronousOperationInterface } from '@/Shared/Application/AsynchronousOperationInterface'

export interface TransactionalExecutorInterface {
  execute<Result>(
    callback: AsynchronousOperationInterface<Result>,
  ): Promise<Result>
}
