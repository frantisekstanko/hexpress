import { LoginService } from '@/Authentication/Application/LoginService'
import { Services } from '@/Authentication/Application/Services'
import { TokenGenerator } from '@/Authentication/Application/TokenGenerator'
import { TokenVerifier } from '@/Authentication/Application/TokenVerifier'
import { UserAuthenticator } from '@/Authentication/Application/UserAuthenticator'
import { AuthenticationMiddleware } from '@/Authentication/Infrastructure/AuthenticationMiddleware'
import { DurationParser } from '@/Authentication/Infrastructure/DurationParser'
import { JwtTokenCodec } from '@/Authentication/Infrastructure/JwtTokenCodec'
import { LoginController } from '@/Authentication/Infrastructure/LoginController'
import { LogoutController } from '@/Authentication/Infrastructure/LogoutController'
import { RefreshTokenController } from '@/Authentication/Infrastructure/RefreshTokenController'
import { RefreshTokenRepository } from '@/Authentication/Infrastructure/RefreshTokenRepository'
import { RouteProvider } from '@/Authentication/Infrastructure/Router/RouteProvider'
import { ContainerInterface } from '@/Core/Application/ContainerInterface'
import { RouteConfig } from '@/Core/Application/Router/RouteConfig'
import { ServiceProviderInterface } from '@/Core/Application/ServiceProviderInterface'

export class ServiceProvider implements ServiceProviderInterface {
  private routeProvider: RouteProvider

  constructor() {
    this.routeProvider = new RouteProvider()
  }

  getRoutes(): RouteConfig[] {
    return this.routeProvider.getRoutes()
  }

  register(container: ContainerInterface): void {
    container.registerSingleton(Services.TokenCodecInterface, JwtTokenCodec)

    container.registerSingleton(
      Services.RefreshTokenRepositoryInterface,
      RefreshTokenRepository,
    )

    container.registerSingleton(
      Services.DurationParserInterface,
      DurationParser,
    )

    container.registerSingleton(
      Services.TokenGeneratorInterface,
      TokenGenerator,
    )

    container.registerSingleton(Services.TokenVerifierInterface, TokenVerifier)

    container.registerSingleton(
      Services.UserAuthenticatorInterface,
      UserAuthenticator,
    )

    container.registerSingletonToSelf(LoginService)

    container.registerTransient(
      Symbol.for(LoginController.name),
      LoginController,
    )

    container.registerTransient(
      Symbol.for(LogoutController.name),
      LogoutController,
    )

    container.registerTransient(
      Symbol.for(RefreshTokenController.name),
      RefreshTokenController,
    )

    container.registerSingletonToSelf(AuthenticationMiddleware)
  }
}
