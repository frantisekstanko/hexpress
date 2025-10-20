import { EventDispatcherInterface } from '@/Core/Application/Event/EventDispatcherInterface'
import { UuidRepositoryInterface } from '@/Core/Application/UuidRepositoryInterface'
import { UserId } from '@/Core/Domain/UserId'
import { CreateUser } from '@/User/Application/CreateUser'
import { PasswordHasherInterface } from '@/User/Application/PasswordHasherInterface'
import { User } from '@/User/Domain/User'
import { UserRepositoryInterface } from '@/User/Domain/UserRepositoryInterface'

export class UserService {
  constructor(
    private readonly uuidRepository: UuidRepositoryInterface,
    private readonly userRepository: UserRepositoryInterface,
    private readonly passwordHasher: PasswordHasherInterface,
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
