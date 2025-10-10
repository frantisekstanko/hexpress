import { injectable } from 'inversify'
import { ClockInterface } from '@/Shared/Domain/Clock/ClockInterface'
import { DateTime } from '@/Shared/Domain/Clock/DateTime'

@injectable()
export class SystemClock implements ClockInterface {
  now(): DateTime {
    return new DateTime()
  }
}
