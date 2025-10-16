import { DateTime } from '@/Core/Domain/Clock/DateTime.js'

export interface ClockInterface {
  now(): DateTime
}
