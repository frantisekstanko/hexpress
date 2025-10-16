import { ClockInterface } from '@/Core/Domain/Clock/ClockInterface'
import { DateTime } from '@/Core/Domain/Clock/DateTime'

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
