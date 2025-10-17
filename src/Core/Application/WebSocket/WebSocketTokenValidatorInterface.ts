export interface WebSocketTokenValidatorInterface {
  isTokenValid(token: string): boolean
}
