import { inject, injectable } from 'inversify'
import { EventDispatcherInterface } from '@/Core/Application/Event/EventDispatcherInterface'
import { Symbols } from '@/Core/Application/Symbols'
import { UuidRepositoryInterface } from '@/Core/Application/UuidRepositoryInterface'
import { UserId } from '@/Core/Domain/UserId'
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
}
