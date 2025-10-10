import { Uuid } from '@/Shared/Domain/Uuid'

const UUID_1 = '7ed64704-52c7-415e-9ab1-ba02d00d599f'
const UUID_2 = 'b5ee19f5-56de-4850-9524-7c87e200532f'

describe('Uuid', () => {
  describe('fromString', () => {
    it('should create UUID from valid string', () => {
      const uuid = Uuid.fromString(UUID_1)
      expect(uuid.toString()).toBe(UUID_1)
    })

    it('should throw on invalid UUID format', () => {
      expect(() => Uuid.fromString('invalid-uuid')).toThrow('Invalid UUID')
    })

    it('should throw on empty string', () => {
      expect(() => Uuid.fromString('')).toThrow('Invalid UUID')
    })
  })

  describe('equals', () => {
    it('should return true for same UUID values', () => {
      const uuid1 = Uuid.fromString(UUID_1)
      const uuid2 = Uuid.fromString(UUID_1)

      expect(uuid1.equals(uuid2)).toBe(true)
    })

    it('should return false for different UUID values', () => {
      const uuid1 = Uuid.fromString(UUID_1)
      const uuid2 = Uuid.fromString(UUID_2)

      expect(uuid1.equals(uuid2)).toBe(false)
    })

    it('should handle UUID case normalization', () => {
      const uuid1 = Uuid.fromString(UUID_1.toLowerCase())
      const uuid2 = Uuid.fromString(UUID_1.toUpperCase())

      expect(uuid1.equals(uuid2)).toBe(true)
    })
  })
})
