export interface TokenClaimsInterface {
  userId: string
  type: 'access' | 'refresh'
  jti: string
  exp: number
}
