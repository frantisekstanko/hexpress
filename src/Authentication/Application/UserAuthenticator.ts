import { inject, injectable } from 'inversify'
import { UserAuthenticatorInterface } from '@/Authentication/Application/UserAuthenticatorInterface'
import { InvalidCredentialsException } from '@/Authentication/Domain/InvalidCredentialsException'
import { UserId } from '@/Core/Domain/UserId'
import { PasswordHasherInterface } from '@/User/Application/PasswordHasherInterface'
import { Services } from '@/User/Application/Services'
import { UserRepositoryInterface } from '@/User/Domain/UserRepositoryInterface'

@injectable()
export class UserAuthenticator implements UserAuthenticatorInterface {
  constructor(
    @inject(Services.UserRepositoryInterface)
    private readonly userRepository: UserRepositoryInterface,
    @inject(Services.PasswordHasherInterface)
    private readonly passwordHasher: PasswordHasherInterface,
  ) {}

  async authenticate(username: string, password: string): Promise<UserId> {
    const user = await this.userRepository.getByUsername(username)
    const passwordMatches = await this.passwordHasher.verifyPassword(
      password,
      user.getPasswordHash(),
    )

    if (!passwordMatches) {
      throw new InvalidCredentialsException('Invalid credentials')
    }

    return user.getUserId()
  }
}
