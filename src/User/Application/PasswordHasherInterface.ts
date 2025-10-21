export interface PasswordHasherInterface {
  hashPassword(password: string): Promise<string>
  verifyPassword(password: string, storedHash: string): Promise<boolean>
}
