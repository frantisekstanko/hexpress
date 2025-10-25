import { DurationParserInterface } from '@/User/Application/DurationParserInterface'

export class DurationParser implements DurationParserInterface {
  parseToSeconds(duration: string): number {
    const match = /^(\d+)([smhd])$/.exec(duration)
    if (!match) {
      throw new Error(`Invalid duration format: ${duration}`)
    }

    const value = Number.parseInt(match[1], 10)
    const unit = match[2]

    const multipliers: Record<string, number> = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
    }

    return value * multipliers[unit]
  }
}
