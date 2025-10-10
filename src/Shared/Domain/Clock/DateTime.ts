import { DateTimeException } from '@/Shared/Domain/Clock/DateTimeException'

export class DateTime {
  private readonly date: Date

  constructor(date: Date = new Date()) {
    this.date = date
  }

  toUnixtime(): number {
    return Math.floor(this.date.getTime() / 1000)
  }

  toDate(): Date {
    return this.date
  }

  static fromUnixtime(seconds: number): DateTime {
    return new DateTime(new Date(seconds * 1000))
  }

  static parse(dateString: string): DateTime {
    return DateTime.fromUnixtime(Date.parse(dateString) / 1000)
  }

  advancedBy(relativeTime: string): DateTime {
    const milliseconds = this.parseRelativeTime(relativeTime)
    return new DateTime(new Date(milliseconds))
  }

  retreatedBy(relativeTime: string): DateTime {
    const milliseconds = this.parseRelativeTime(relativeTime)
    return new DateTime(
      new Date(this.date.getTime() - (milliseconds - this.date.getTime())),
    )
  }

  private parseRelativeTime(relativeTime: string): number {
    const regex = /(\d+)\s*(second|minute|hour|day|week|month|year)s?/i
    const match = regex.exec(relativeTime)

    if (!match) {
      throw new DateTimeException('Invalid format')
    }

    const value = parseInt(match[1], 10)

    const unit = match[2].toLowerCase() as keyof typeof millisecondsMap

    const millisecondsMap = {
      second: 1000,
      minute: 60 * 1000,
      hour: 60 * 60 * 1000,
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
      year: 365 * 24 * 60 * 60 * 1000,
    }

    return this.date.getTime() + value * millisecondsMap[unit]
  }
}
