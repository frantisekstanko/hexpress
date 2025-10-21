import { EventInterface } from '@/Core/Domain/Event/EventInterface'
import { EventLevel } from '@/Core/Domain/Event/EventLevel'
import { EventType } from '@/Core/Domain/Event/EventType'
import { UserId } from '@/Core/Domain/UserId'
import { Username } from '@/User/Domain/Username'

export class UserWasCreated implements EventInterface {
  private readonly userId: UserId
  private readonly username: Username

  constructor(args: { userId: UserId; username: Username }) {
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
      username: this.username.toString(),
    }
  }

  public getEventType(): EventType {
    return EventType.MANUAL
  }

  public getUserId(): UserId {
    return this.userId
  }

  public getUsername(): Username {
    return this.username
  }
}
