export class TokenBuilder {
  public static create(params: { accessToken: string; refreshToken: string }): {
    accessToken: string
    refreshToken: string
  } {
    return {
      accessToken: params.accessToken,
      refreshToken: params.refreshToken,
    }
  }
}
