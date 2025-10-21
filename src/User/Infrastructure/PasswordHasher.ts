import argon2, { argon2id } from 'argon2'
import { PasswordHasherInterface } from '@/User/Application/PasswordHasherInterface'

export class PasswordHasher implements PasswordHasherInterface {
  private readonly ARGON2_OPTIONS = {
    type: argon2id,
    timeCost: 3,
    memoryCost: 64 * 1024,
    parallelism: 1,
    hashLength: 32,
    saltLength: 16,
  }

  async hashPassword(password: string): Promise<string> {
    return await argon2.hash(password, this.ARGON2_OPTIONS)
  }

  async verifyPassword(password: string, storedHash: string) {
    return await argon2.verify(storedHash, password)
  }
}
