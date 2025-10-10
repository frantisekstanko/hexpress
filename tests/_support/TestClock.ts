import { ClockInterface } from '@/Shared/Domain/Clock/ClockInterface'
import { DateTime } from '@/Shared/Domain/Clock/DateTime'

export class TestClock implements ClockInterface {
  private currentTime: DateTime | undefined

  constructor(initialTime?: DateTime) {
    this.currentTime = initialTime
  }

  now(): DateTime {
    if (!this.currentTime) {
      throw new Error('You must setTime() on TestClock before calling now()')
    }

    return this.currentTime
  }

  setTime(time: DateTime): void {
    this.currentTime = time
  }
}
