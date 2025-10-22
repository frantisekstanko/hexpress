import { DatabaseContextInterface } from '@/Core/Application/Database/DatabaseContextInterface'
import { DatabaseRecordInterface } from '@/Core/Application/Database/DatabaseRecordInterface'
import { EventOutbox } from '@/Core/Application/Event/EventOutbox'
import { EventOutboxId } from '@/Core/Application/Event/EventOutboxId'
import { EventOutboxRepositoryInterface } from '@/Core/Application/Event/EventOutboxRepositoryInterface'
import { UuidRepositoryInterface } from '@/Core/Application/UuidRepositoryInterface'
import { ClockInterface } from '@/Core/Domain/Clock/ClockInterface'
import { DateTime } from '@/Core/Domain/Clock/DateTime'
import { EventInterface } from '@/Core/Domain/Event/EventInterface'
import { DatabaseRowMapper } from '@/Core/Infrastructure/DatabaseRowMapper'

export class DatabaseEventOutboxRepository
  implements EventOutboxRepositoryInterface
{
  constructor(
    private readonly databaseContext: DatabaseContextInterface,
    private readonly uuidRepository: UuidRepositoryInterface,
    private readonly clock: ClockInterface,
  ) {}

  async saveMany(events: EventInterface[]): Promise<void> {
    if (events.length === 0) {
      return
    }

    const timeNow = this.clock.now()
    const values: string[] = []
    const parameters: unknown[] = []

    for (const event of events) {
      values.push('(?, ?, ?, ?, ?)')
      parameters.push(
        this.uuidRepository.getUuid().toString(),
        event.constructor.name,
        JSON.stringify(event),
        timeNow.toUnixtime(),
        null,
      )
    }

    await this.databaseContext
      .getDatabase()
      .query(
        `INSERT INTO event_outbox (id, event_name, event_payload, created_at, processed_at) VALUES ${values.join(', ')}`,
        parameters,
      )
  }

  async getUnprocessed(limit: number): Promise<EventOutbox[]> {
    const rows = await this.databaseContext.getDatabase().query(
      `SELECT id, event_name, event_payload, created_at, processed_at
         FROM event_outbox
         WHERE processed_at IS NULL
         ORDER BY created_at
         LIMIT ?
         FOR UPDATE SKIP LOCKED`,
      [limit],
    )

    return rows.map((row) => this.mapRowToEventOutbox(row))
  }

  async markAsProcessed(id: EventOutboxId): Promise<void> {
    const timeNow = this.clock.now()

    await this.databaseContext
      .getDatabase()
      .query(`UPDATE event_outbox SET processed_at = ? WHERE id = ?`, [
        timeNow.toUnixtime(),
        id.toString(),
      ])
  }

  private mapRowToEventOutbox(row: DatabaseRecordInterface): EventOutbox {
    const id = DatabaseRowMapper.extractString(row, 'id')
    const eventPayload = DatabaseRowMapper.extractString(row, 'event_payload')
    const createdAt = DatabaseRowMapper.extractNumber(row, 'created_at')
    const processedAt = DatabaseRowMapper.extractNumberOrNull(
      row,
      'processed_at',
    )

    return new EventOutbox({
      id: EventOutboxId.fromString(id),
      event: JSON.parse(eventPayload) as EventInterface,
      createdAt: DateTime.fromUnixtime(createdAt),
      processedAt:
        processedAt !== null ? DateTime.fromUnixtime(processedAt) : null,
    })
  }
}
