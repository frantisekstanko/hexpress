import { DatabaseRecordInterface } from '@/Core/Application/Database/DatabaseRecordInterface'
import { Assertion } from '@/Core/Domain/Assert/Assertion'

export class DatabaseRowMapper {
  static extractString(
    row: DatabaseRecordInterface,
    fieldName: string,
  ): string {
    Assertion.string(
      row[fieldName],
      `Field '${fieldName}' was expected to be a string`,
    )
    return row[fieldName]
  }

  static extractNumber(
    row: DatabaseRecordInterface,
    fieldName: string,
  ): number {
    Assertion.number(
      row[fieldName],
      `Field '${fieldName}' was expected to be a number`,
    )
    return row[fieldName]
  }

  static extractNumberOrNull(
    row: DatabaseRecordInterface,
    fieldName: string,
  ): number | null {
    Assertion.nullOrNumber(
      row[fieldName],
      `Field '${fieldName}' was expected to be a number or null`,
    )
    return row[fieldName]
  }

  static extractStringOrNull(
    row: DatabaseRecordInterface,
    fieldName: string,
  ): string | null {
    Assertion.nullOrString(
      row[fieldName],
      `Field '${fieldName}' was expected to be a string or null`,
    )
    return row[fieldName]
  }
}
