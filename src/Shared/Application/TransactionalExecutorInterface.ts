export interface TransactionalExecutorInterface {
  execute<Result>(callback: () => Promise<Result>): Promise<Result>
}
