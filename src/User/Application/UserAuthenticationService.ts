import { UserId } from '@/Core/Domain/UserId'
import { PasswordHasherInterface } from '@/User/Application/PasswordHasherInterface'
import { InvalidCredentialsException } from '@/User/Domain/InvalidCredentialsException'
import { Username } from '@/User/Domain/Username'
import { UserRepositoryInterface } from '@/User/Domain/UserRepositoryInterface'

export class UserAuthenticationService {
  constructor(
    private readonly userRepository: UserRepositoryInterface,
    private readonly passwordHasher: PasswordHasherInterface,
  ) {}

  async authenticate(username: string, password: string): Promise<UserId> {
    const user = await this.userRepository.getByUsername(
      Username.fromString(username),
    )
    const passwordMatches = await this.passwordHasher.verifyPassword(
      password,
      user.getPasswordHash().toString(),
    )

    if (!passwordMatches) {
      throw new InvalidCredentialsException('Invalid credentials')
    }

    return user.getUserId()
  }
}
