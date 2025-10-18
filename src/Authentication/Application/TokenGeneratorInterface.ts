import { UserId } from '@/Core/Domain/UserId'

export interface TokenGeneratorInterface {
  generateAccessToken(userId: UserId): string
  generateRefreshToken(userId: UserId): string
}
