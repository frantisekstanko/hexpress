import { DurationParser } from '@/Authentication/Infrastructure/DurationParser'

describe('DurationParser', () => {
  let durationParser: DurationParser

  beforeEach(() => {
    durationParser = new DurationParser()
  })

  describe('parseToSeconds', () => {
    it('should parse seconds correctly', () => {
      expect(durationParser.parseToSeconds('1s')).toBe(1)
      expect(durationParser.parseToSeconds('30s')).toBe(30)
      expect(durationParser.parseToSeconds('120s')).toBe(120)
    })

    it('should parse minutes correctly', () => {
      expect(durationParser.parseToSeconds('1m')).toBe(60)
      expect(durationParser.parseToSeconds('5m')).toBe(300)
      expect(durationParser.parseToSeconds('60m')).toBe(3600)
    })

    it('should parse hours correctly', () => {
      expect(durationParser.parseToSeconds('1h')).toBe(3600)
      expect(durationParser.parseToSeconds('2h')).toBe(7200)
      expect(durationParser.parseToSeconds('24h')).toBe(86400)
    })

    it('should parse days correctly', () => {
      expect(durationParser.parseToSeconds('1d')).toBe(86400)
      expect(durationParser.parseToSeconds('7d')).toBe(604800)
      expect(durationParser.parseToSeconds('30d')).toBe(2592000)
    })

    it('should throw error for invalid format', () => {
      expect(() => durationParser.parseToSeconds('invalid')).toThrow(
        'Invalid duration format: invalid',
      )
      expect(() => durationParser.parseToSeconds('10')).toThrow(
        'Invalid duration format: 10',
      )
      expect(() => durationParser.parseToSeconds('10x')).toThrow(
        'Invalid duration format: 10x',
      )
      expect(() => durationParser.parseToSeconds('s10')).toThrow(
        'Invalid duration format: s10',
      )
    })

    it('should throw error for empty string', () => {
      expect(() => durationParser.parseToSeconds('')).toThrow(
        'Invalid duration format: ',
      )
    })
  })
})
