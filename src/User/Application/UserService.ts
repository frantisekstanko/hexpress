import { inject, injectable } from 'inversify'
import { EventDispatcherInterface } from '@/Shared/Application/Event/EventDispatcherInterface'
import { Symbols } from '@/Shared/Application/Symbols'
import { UuidRepositoryInterface } from '@/Shared/Application/UuidRepositoryInterface'
import { UserId } from '@/Shared/Domain/UserId'
import { CreateUser } from '@/User/Application/CreateUser'
import { PasswordHasherInterface } from '@/User/Application/PasswordHasherInterface'
import { User } from '@/User/Domain/User'
import { UserRepositoryInterface } from '@/User/Domain/UserRepositoryInterface'

@injectable()
export class UserService {
  constructor(
    @inject(Symbols.UuidRepositoryInterface)
    private readonly uuidRepository: UuidRepositoryInterface,
    @inject(Symbols.UserRepositoryInterface)
    private readonly userRepository: UserRepositoryInterface,
    @inject(Symbols.PasswordHasherInterface)
    private readonly passwordHasher: PasswordHasherInterface,
    @inject(Symbols.EventDispatcherInterface)
    private readonly eventDispatcher: EventDispatcherInterface,
  ) {}

  public async createUser(createUser: CreateUser): Promise<UserId> {
    const newUserId = new UserId(this.uuidRepository.getUuid())
    const hashedPassword = await this.passwordHasher.hashPassword(
      createUser.getPassword(),
    )

    const newUser = User.create({
      userId: newUserId,
      username: createUser.getUsername(),
      password: hashedPassword,
    })

    await this.userRepository.save(newUser)

    for (const event of newUser.releaseEvents()) {
      await this.eventDispatcher.dispatch(event)
    }

    return newUserId
  }

  public async authenticateUser(
    username: string,
    password: string,
  ): Promise<UserId> {
    const user = await this.userRepository.getByUsername(username)
    const passwordMatches = await this.passwordHasher.verifyPassword(
      password,
      user.getPasswordHash(),
    )

    if (!passwordMatches) {
      throw new Error('Invalid credentials')
    }

    return user.getUserId()
  }
}
