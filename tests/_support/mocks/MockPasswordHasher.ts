import { PasswordHasherInterface } from '@/User/Application/PasswordHasherInterface'

export class MockPasswordHasher implements PasswordHasherInterface {
  hashPassword = jest.fn()
  verifyPassword = jest.fn()
  generateAuthenticationToken = jest.fn()
}
