import { randomUUID } from 'node:crypto'
import { inject, injectable } from 'inversify'
import jwt, { SignOptions } from 'jsonwebtoken'
import { ConfigInterface } from '@/Shared/Application/Config/ConfigInterface'
import { ConfigOption } from '@/Shared/Application/Config/ConfigOption'
import { DatabaseContextInterface } from '@/Shared/Application/Database/DatabaseContextInterface'
import { JwtPayload } from '@/Shared/Application/JwtPayload'
import { Symbols } from '@/Shared/Application/Symbols'
import { TokenPair } from '@/Shared/Application/TokenPair'
import { DateTime } from '@/Shared/Domain/Clock/DateTime'
import { UserId } from '@/Shared/Domain/UserId'

@injectable()
export class LoginService {
  constructor(
    @inject(Symbols.ConfigInterface)
    private readonly config: ConfigInterface,
    @inject(Symbols.DatabaseContextInterface)
    private readonly databaseContext: DatabaseContextInterface,
  ) {}

  async generateTokenPair(userId: UserId): Promise<TokenPair> {
    const accessToken = this.generateAccessToken(userId)
    const refreshToken = this.generateRefreshToken(userId)

    await this.storeRefreshToken(refreshToken, userId)

    return { accessToken, refreshToken }
  }

  verifyAccessToken(token: string): Promise<JwtPayload> {
    try {
      const payload = jwt.verify(
        token,
        this.config.get(ConfigOption.JWT_ACCESS_SECRET),
      ) as JwtPayload

      if (payload.type !== 'access') {
        throw new Error('Invalid token type')
      }

      return Promise.resolve(payload)
    } catch {
      throw new Error('Invalid or expired access token')
    }
  }

  async verifyRefreshToken(token: string): Promise<JwtPayload> {
    try {
      const payload = jwt.verify(
        token,
        this.config.get(ConfigOption.JWT_REFRESH_SECRET),
      ) as JwtPayload

      if (payload.type !== 'refresh') {
        throw new Error('Invalid token type')
      }

      const exists = await this.refreshTokenExists(token)
      if (!exists) {
        throw new Error('Refresh token has been revoked')
      }

      return payload
    } catch {
      throw new Error('Invalid or expired refresh token')
    }
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await this.databaseContext
      .getCurrentDatabase()
      .query('DELETE FROM refresh_tokens WHERE token = ?', [token])
  }

  private generateAccessToken(userId: UserId): string {
    const payload = {
      userId: userId.toString(),
      type: 'access',
      jti: randomUUID(),
    } as JwtPayload
    return jwt.sign(payload, this.config.get(ConfigOption.JWT_ACCESS_SECRET), {
      expiresIn: this.config.get(ConfigOption.JWT_ACCESS_EXPIRY),
    } as SignOptions)
  }

  private generateRefreshToken(userId: UserId): string {
    const payload = {
      userId: userId.toString(),
      type: 'refresh',
      jti: randomUUID(),
    } as JwtPayload
    return jwt.sign(payload, this.config.get(ConfigOption.JWT_REFRESH_SECRET), {
      expiresIn: this.config.get(ConfigOption.JWT_REFRESH_EXPIRY),
    } as SignOptions)
  }

  private async storeRefreshToken(
    token: string,
    userId: UserId,
  ): Promise<void> {
    const decoded = jwt.decode(token) as { exp: number }
    const expiresAt = new Date(decoded.exp * 1000)
    const timeNow = new DateTime()

    await this.databaseContext
      .getCurrentDatabase()
      .query(
        'INSERT INTO refresh_tokens (token, userId, created_at, expires_at) VALUES (?, ?, ?, ?)',
        [
          token,
          userId.toString(),
          timeNow.toUnixtime(),
          new DateTime(expiresAt).toUnixtime(),
        ],
      )
  }

  private async refreshTokenExists(token: string): Promise<boolean> {
    const result = await this.databaseContext
      .getCurrentDatabase()
      .query(
        'SELECT 1 FROM refresh_tokens WHERE token = ? AND expires_at > UNIX_TIMESTAMP()',
        [token],
      )
    return result.length > 0
  }
}
