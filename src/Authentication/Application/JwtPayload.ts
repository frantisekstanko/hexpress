export interface JwtPayload {
  userId: string
  type: 'access' | 'refresh'
  jti?: string
}
