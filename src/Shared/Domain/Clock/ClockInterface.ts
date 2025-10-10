import { DateTime } from '@/Shared/Domain/Clock/DateTime.js'

export interface ClockInterface {
  now(): DateTime
}
