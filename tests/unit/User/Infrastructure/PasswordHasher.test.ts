import { PasswordHasher } from '@/User/Infrastructure/PasswordHasher'

describe('PasswordHasher', () => {
  let passwordHasher: PasswordHasher

  beforeEach(() => {
    passwordHasher = new PasswordHasher()
  })

  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'testPassword123'

      const hashedPassword = await passwordHasher.hashPassword(password)

      expect(hashedPassword).not.toBe(password)
      expect(hashedPassword).toMatch(/^\$argon2id\$/)
    })
  })

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'testPassword123'
      const hashedPassword = await passwordHasher.hashPassword(password)

      const isValid = await passwordHasher.verifyPassword(
        password,
        hashedPassword,
      )

      expect(isValid).toBe(true)
    })

    it('should reject incorrect password', async () => {
      const password = 'testPassword123'
      const hashedPassword = await passwordHasher.hashPassword(password)

      const isValid = await passwordHasher.verifyPassword(
        'wrongPassword',
        hashedPassword,
      )

      expect(isValid).toBe(false)
    })
  })

  describe('generateAuthenticationToken', () => {
    it('should generate a token', () => {
      const token = passwordHasher.generateAuthenticationToken()

      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.length).toBeGreaterThan(0)
    })

    it('should generate unique tokens', () => {
      const token1 = passwordHasher.generateAuthenticationToken()
      const token2 = passwordHasher.generateAuthenticationToken()

      expect(token1).not.toBe(token2)
    })

    it('should generate hex string token', () => {
      const token = passwordHasher.generateAuthenticationToken()

      expect(token).toMatch(/^[0-9a-f]+$/)
    })
  })
})
