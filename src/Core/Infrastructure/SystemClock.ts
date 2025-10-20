import { ClockInterface } from '@/Core/Domain/Clock/ClockInterface'
import { DateTime } from '@/Core/Domain/Clock/DateTime'

export class SystemClock implements ClockInterface {
  now(): DateTime {
    return new DateTime()
  }
}
