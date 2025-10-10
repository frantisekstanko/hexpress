import { EventInterface } from '@/Shared/Domain/Event/EventInterface'
import { EventLevel } from '@/Shared/Domain/Event/EventLevel'
import { EventType } from '@/Shared/Domain/Event/EventType'
import { UserId } from '@/Shared/Domain/UserId'

export class UserWasCreated implements EventInterface {
  private readonly userId: UserId
  private readonly username: string

  constructor(args: { userId: UserId; username: string }) {
    this.userId = args.userId
    this.username = args.username
  }

  public getEventName(): string {
    return 'UserWasCreated'
  }

  public getLevel(): EventLevel {
    return EventLevel.INFO
  }

  public getLogMessage(): string {
    return `User ${this.userId.toString()} was created`
  }

  public getLogContext(): Record<string, string | number> {
    return {
      userId: this.userId.toString(),
      username: this.username,
    }
  }

  public getEventType(): EventType {
    return EventType.MANUAL
  }

  public getUserId(): UserId {
    return this.userId
  }

  public getUsername(): string {
    return this.username
  }
}
