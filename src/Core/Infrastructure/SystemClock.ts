import { injectable } from 'inversify'
import { ClockInterface } from '@/Core/Domain/Clock/ClockInterface'
import { DateTime } from '@/Core/Domain/Clock/DateTime'

@injectable()
export class SystemClock implements ClockInterface {
  now(): DateTime {
    return new DateTime()
  }
}
