import { DatabaseRecordInterface } from '@/Core/Application/Database/DatabaseRecordInterface'
import { AssertionFailedException } from '@/Core/Domain/Assert/AssertionFailedException'
import { DatabaseRowMapper } from '@/Core/Infrastructure/DatabaseRowMapper'

describe('DatabaseRowMapper', () => {
  describe('extractString', () => {
    it('should extract string value from row', () => {
      const row: DatabaseRecordInterface = {
        name: 'John Doe',
      }

      const result = DatabaseRowMapper.extractString(row, 'name')

      expect(result).toBe('John Doe')
    })

    it('should throw AssertionFailedException when field is not a string', () => {
      const row: DatabaseRecordInterface = {
        age: 42,
      }

      expect(() => DatabaseRowMapper.extractString(row, 'age')).toThrow(
        AssertionFailedException,
      )
      expect(() => DatabaseRowMapper.extractString(row, 'age')).toThrow(
        "Field 'age' was expected to be a string",
      )
    })

    it('should throw AssertionFailedException when field is null', () => {
      const row: DatabaseRecordInterface = {
        name: null,
      }

      expect(() => DatabaseRowMapper.extractString(row, 'name')).toThrow(
        AssertionFailedException,
      )
    })

    it('should throw AssertionFailedException when field is undefined', () => {
      const row: DatabaseRecordInterface = {}

      expect(() => DatabaseRowMapper.extractString(row, 'missing')).toThrow(
        AssertionFailedException,
      )
    })
  })

  describe('extractNumber', () => {
    it('should extract number value from row', () => {
      const row: DatabaseRecordInterface = {
        age: 42,
      }

      const result = DatabaseRowMapper.extractNumber(row, 'age')

      expect(result).toBe(42)
    })

    it('should extract zero value from row', () => {
      const row: DatabaseRecordInterface = {
        count: 0,
      }

      const result = DatabaseRowMapper.extractNumber(row, 'count')

      expect(result).toBe(0)
    })

    it('should extract negative number value from row', () => {
      const row: DatabaseRecordInterface = {
        balance: -100,
      }

      const result = DatabaseRowMapper.extractNumber(row, 'balance')

      expect(result).toBe(-100)
    })

    it('should throw AssertionFailedException when field is not a number', () => {
      const row: DatabaseRecordInterface = {
        name: 'John',
      }

      expect(() => DatabaseRowMapper.extractNumber(row, 'name')).toThrow(
        AssertionFailedException,
      )
      expect(() => DatabaseRowMapper.extractNumber(row, 'name')).toThrow(
        "Field 'name' was expected to be a number",
      )
    })

    it('should throw AssertionFailedException when field is null', () => {
      const row: DatabaseRecordInterface = {
        age: null,
      }

      expect(() => DatabaseRowMapper.extractNumber(row, 'age')).toThrow(
        AssertionFailedException,
      )
    })
  })

  describe('extractStringOrNull', () => {
    it('should extract string value from row', () => {
      const row: DatabaseRecordInterface = {
        description: 'Test description',
      }

      const result = DatabaseRowMapper.extractStringOrNull(row, 'description')

      expect(result).toBe('Test description')
    })

    it('should extract null value from row', () => {
      const row: DatabaseRecordInterface = {
        description: null,
      }

      const result = DatabaseRowMapper.extractStringOrNull(row, 'description')

      expect(result).toBeNull()
    })

    it('should extract empty string from row', () => {
      const row: DatabaseRecordInterface = {
        description: '',
      }

      const result = DatabaseRowMapper.extractStringOrNull(row, 'description')

      expect(result).toBe('')
    })

    it('should throw AssertionFailedException when field is not a string or null', () => {
      const row: DatabaseRecordInterface = {
        value: 123,
      }

      expect(() => DatabaseRowMapper.extractStringOrNull(row, 'value')).toThrow(
        AssertionFailedException,
      )
      expect(() => DatabaseRowMapper.extractStringOrNull(row, 'value')).toThrow(
        "Field 'value' was expected to be a string or null",
      )
    })

    it('should throw AssertionFailedException when field is undefined', () => {
      const row: DatabaseRecordInterface = {}

      expect(() =>
        DatabaseRowMapper.extractStringOrNull(row, 'missing'),
      ).toThrow(AssertionFailedException)
    })
  })

  describe('extractNumberOrNull', () => {
    it('should extract number value from row', () => {
      const row: DatabaseRecordInterface = {
        score: 85,
      }

      const result = DatabaseRowMapper.extractNumberOrNull(row, 'score')

      expect(result).toBe(85)
    })

    it('should extract null value from row', () => {
      const row: DatabaseRecordInterface = {
        score: null,
      }

      const result = DatabaseRowMapper.extractNumberOrNull(row, 'score')

      expect(result).toBeNull()
    })

    it('should extract zero value from row', () => {
      const row: DatabaseRecordInterface = {
        score: 0,
      }

      const result = DatabaseRowMapper.extractNumberOrNull(row, 'score')

      expect(result).toBe(0)
    })

    it('should throw AssertionFailedException when field is not a number or null', () => {
      const row: DatabaseRecordInterface = {
        name: 'Alice',
      }

      expect(() => DatabaseRowMapper.extractNumberOrNull(row, 'name')).toThrow(
        AssertionFailedException,
      )
      expect(() => DatabaseRowMapper.extractNumberOrNull(row, 'name')).toThrow(
        "Field 'name' was expected to be a number or null",
      )
    })

    it('should throw AssertionFailedException when field is undefined', () => {
      const row: DatabaseRecordInterface = {}

      expect(() =>
        DatabaseRowMapper.extractNumberOrNull(row, 'missing'),
      ).toThrow(AssertionFailedException)
    })
  })
})
