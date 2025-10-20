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
import { Services as CoreServices } from '@/Core/Application/Services'
import { Services as UserServices } from '@/User/Application/Services'

export class ServiceProvider implements ServiceProviderInterface {
  private routeProvider: RouteProvider

  constructor() {
    this.routeProvider = new RouteProvider()
  }

  getRoutes(): RouteConfig[] {
    return this.routeProvider.getRoutes()
  }

  register(container: ContainerInterface): void {
    container.register(
      Services.TokenCodecInterface,
      (container) =>
        new JwtTokenCodec(container.get(CoreServices.ClockInterface)),
    )

    container.register(
      Services.RefreshTokenRepositoryInterface,
      (container) =>
        new RefreshTokenRepository(
          container.get(CoreServices.DatabaseContextInterface),
          container.get(CoreServices.ClockInterface),
        ),
    )

    container.register(
      Services.DurationParserInterface,
      () => new DurationParser(),
    )

    container.register(
      Services.TokenGeneratorInterface,
      (container) =>
        new TokenGenerator(
          container.get(CoreServices.ConfigInterface),
          container.get(CoreServices.ClockInterface),
          container.get(Services.TokenCodecInterface),
          container.get(Services.DurationParserInterface),
          container.get(CoreServices.UuidRepositoryInterface),
        ),
    )

    container.register(
      Services.TokenVerifierInterface,
      (container) =>
        new TokenVerifier(
          container.get(CoreServices.ConfigInterface),
          container.get(Services.TokenCodecInterface),
          container.get(Services.RefreshTokenRepositoryInterface),
        ),
    )

    container.register(
      Services.UserAuthenticatorInterface,
      (container) =>
        new UserAuthenticator(
          container.get(UserServices.UserRepositoryInterface),
          container.get(UserServices.PasswordHasherInterface),
        ),
    )

    container.register(
      LoginService,
      (container) =>
        new LoginService(
          container.get(Services.TokenGeneratorInterface),
          container.get(Services.TokenVerifierInterface),
          container.get(Services.UserAuthenticatorInterface),
          container.get(Services.TokenCodecInterface),
          container.get(Services.RefreshTokenRepositoryInterface),
        ),
    )

    container.register(
      Symbol.for(LoginController.name),
      (container) => new LoginController(container.get(LoginService)),
    )

    container.register(
      Symbol.for(LogoutController.name),
      (container) => new LogoutController(container.get(LoginService)),
    )

    container.register(
      Symbol.for(RefreshTokenController.name),
      (container) => new RefreshTokenController(container.get(LoginService)),
    )

    container.register(
      AuthenticationMiddleware,
      (container) =>
        new AuthenticationMiddleware(
          container.get(LoginService),
          container.get(CoreServices.LoggerInterface),
        ),
    )
  }
}
