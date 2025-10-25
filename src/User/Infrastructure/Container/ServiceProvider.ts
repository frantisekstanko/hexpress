import { ContainerInterface } from '@/Core/Application/ContainerInterface'
import { ServiceProviderInterface } from '@/Core/Application/ServiceProviderInterface'
import { Services as CoreServices } from '@/Core/Application/Services'
import { AuthenticatedRouteSecurityPolicyFactory } from '@/Core/Infrastructure/Router/AuthenticatedRouteSecurityPolicyFactory'
import { CreateUserCommandHandler } from '@/User/Application/CreateUserCommandHandler'
import { Services, Services as UserServices } from '@/User/Application/Services'
import { TokenGenerator } from '@/User/Application/TokenGenerator'
import { TokenService } from '@/User/Application/TokenService'
import { UserAuthenticationService } from '@/User/Application/UserAuthenticationService'
import { UserService } from '@/User/Application/UserService'
import { AuthenticationHandler } from '@/User/Infrastructure/AuthenticationHandler'
import { AuthenticationMiddleware } from '@/User/Infrastructure/AuthenticationMiddleware'
import { CommandHandlerRegistry } from '@/User/Infrastructure/Container/CommandHandlerRegistry'
import { CreateUserController } from '@/User/Infrastructure/CreateUserController'
import { DurationParser } from '@/User/Infrastructure/DurationParser'
import { JwtTokenCodec } from '@/User/Infrastructure/JwtTokenCodec'
import { LoginController } from '@/User/Infrastructure/LoginController'
import { LogoutController } from '@/User/Infrastructure/LogoutController'
import { PasswordHasher } from '@/User/Infrastructure/PasswordHasher'
import { RefreshTokenController } from '@/User/Infrastructure/RefreshTokenController'
import { RefreshTokenRepository } from '@/User/Infrastructure/RefreshTokenRepository'
import { UserRepository } from '@/User/Infrastructure/UserRepository'

export class ServiceProvider implements ServiceProviderInterface {
  register(container: ContainerInterface): void {
    container.register(
      Services.PasswordHasherInterface,
      () => new PasswordHasher(),
    )

    container.register(
      UserService,
      (container) =>
        new UserService(
          container.get(CoreServices.UuidRepositoryInterface),
          container.get(Services.UserRepositoryInterface),
          container.get(Services.PasswordHasherInterface),
          container.get(CoreServices.EventCollectionContextInterface),
        ),
    )

    container.register(
      CreateUserCommandHandler,
      (container) => new CreateUserCommandHandler(container.get(UserService)),
    )

    container.register(
      Services.UserRepositoryInterface,
      (container) =>
        new UserRepository(
          container.get(CoreServices.DatabaseContextInterface),
        ),
    )

    container.register(
      Symbol.for(CreateUserController.name),
      (container) =>
        new CreateUserController(
          container.get(CoreServices.CommandBusInterface),
        ),
    )

    CommandHandlerRegistry.register(container)

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
      TokenService,
      (container) =>
        new TokenService(
          container.get(Services.TokenGeneratorInterface),
          container.get(Services.TokenCodecInterface),
          container.get(Services.RefreshTokenRepositoryInterface),
          container.get(CoreServices.ConfigInterface),
        ),
    )

    container.register(
      CoreServices.AuthenticationHandlerInterface,
      (container) => new AuthenticationHandler(container.get(TokenService)),
    )

    container.register(
      UserAuthenticationService,
      (container) =>
        new UserAuthenticationService(
          container.get(UserServices.UserRepositoryInterface),
          container.get(UserServices.PasswordHasherInterface),
        ),
    )

    container.register(
      Symbol.for(LoginController.name),
      (container) =>
        new LoginController(
          container.get(UserAuthenticationService),
          container.get(TokenService),
        ),
    )

    container.register(
      Symbol.for(LogoutController.name),
      (container) => new LogoutController(container.get(TokenService)),
    )

    container.register(
      Symbol.for(RefreshTokenController.name),
      (container) => new RefreshTokenController(container.get(TokenService)),
    )

    container.register(
      CoreServices.AuthenticationMiddlewareInterface,
      (container) =>
        new AuthenticationMiddleware(
          container.get(TokenService),
          container.get(CoreServices.LoggerInterface),
        ),
    )

    container.register(
      AuthenticatedRouteSecurityPolicyFactory,
      (container) =>
        new AuthenticatedRouteSecurityPolicyFactory(
          container.get(CoreServices.AuthenticationMiddlewareInterface),
        ),
    )
  }
}
