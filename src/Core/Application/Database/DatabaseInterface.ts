import { DatabaseRecordInterface } from '@/Core/Application/Database/DatabaseRecordInterface'

export interface DatabaseInterface {
  query(sql: string, params?: unknown[]): Promise<DatabaseRecordInterface[]>
}
