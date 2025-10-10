import { DatabaseInterface } from '@/Shared/Application/Database/DatabaseInterface'

export interface DatabaseContextInterface {
  getCurrentDatabase(): DatabaseInterface
  runInContext<Result>(
    database: DatabaseInterface,
    callback: () => Promise<Result>,
  ): Promise<Result>
}
