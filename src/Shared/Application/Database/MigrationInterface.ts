export interface MigrationInterface {
  up(): Promise<void>
  down(): Promise<void>
}
