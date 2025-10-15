import { DatabaseRecordInterface } from '@/Shared/Application/Database/DatabaseRecordInterface'

export interface DatabaseInterface {
  query(sql: string, params?: unknown[]): Promise<DatabaseRecordInterface[]>
}
