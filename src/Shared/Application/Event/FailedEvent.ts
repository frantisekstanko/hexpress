import { EventInterface } from '@/Shared/Domain/Event/EventInterface'

export class FailedEvent {
  private readonly event: EventInterface
  private readonly listenerName: string
  private readonly error: Error
  private readonly failedAt: Date

  constructor(props: {
    event: EventInterface
    listenerName: string
    error: Error
    failedAt: Date
  }) {
    this.event = props.event
    this.listenerName = props.listenerName
    this.error = props.error
    this.failedAt = props.failedAt
  }

  public getEvent(): EventInterface {
    return this.event
  }

  public getListenerName(): string {
    return this.listenerName
  }

  public getError(): Error {
    return this.error
  }

  public getFailedAt(): Date {
    return this.failedAt
  }
}
