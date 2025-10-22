import { EventOutboxId } from '@/Core/Application/Event/EventOutboxId'
import { DateTimeInterface } from '@/Core/Domain/Clock/DateTimeInterface'
import { EventInterface } from '@/Core/Domain/Event/EventInterface'

export class EventOutbox {
  private readonly id: EventOutboxId
  private readonly event: EventInterface
  private readonly createdAt: DateTimeInterface
  private readonly processedAt: DateTimeInterface | null

  constructor(props: {
    id: EventOutboxId
    event: EventInterface
    createdAt: DateTimeInterface
    processedAt: DateTimeInterface | null
  }) {
    this.id = props.id
    this.event = props.event
    this.createdAt = props.createdAt
    this.processedAt = props.processedAt
  }

  public getId(): EventOutboxId {
    return this.id
  }

  public getEvent(): EventInterface {
    return this.event
  }

  public getCreatedAt(): DateTimeInterface {
    return this.createdAt
  }

  public getProcessedAt(): DateTimeInterface | null {
    return this.processedAt
  }

  public isProcessed(): boolean {
    return this.processedAt !== null
  }
}
