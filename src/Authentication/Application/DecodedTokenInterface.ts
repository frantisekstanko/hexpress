import { DateTimeInterface } from '@/Core/Domain/Clock/DateTimeInterface'

export interface DecodedTokenInterface {
  expiresAt: DateTimeInterface
}
