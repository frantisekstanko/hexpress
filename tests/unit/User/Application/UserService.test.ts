import { MockUuidRepository } from '@Tests/_support/mocks/MockUuidRepository'
import { EventDispatcherInterface } from '@/Core/Application/Event/EventDispatcherInterface'
import { UserId } from '@/Core/Domain/UserId'
import { CreateUser } from '@/User/Application/CreateUser'
import { PasswordHasherInterface } from '@/User/Application/PasswordHasherInterface'
import { UserService } from '@/User/Application/UserService'
import { Username } from '@/User/Domain/Username'
import { UserRepositoryInterface } from '@/User/Domain/UserRepositoryInterface'
import { UserWasCreated } from '@/User/Domain/UserWasCreated'

const USER_ID = '93906a9e-250e-4151-b2e7-4f0ffcb3e11f'
const USERNAME = 'testuser'
const PASSWORD = 'password123'
const HASHED_PASSWORD = 'hashed_password123'

describe('UserService', () => {
  let userService: UserService
  let uuidRepository: MockUuidRepository
  let userRepository: jest.Mocked<UserRepositoryInterface>
  let passwordHasher: jest.Mocked<PasswordHasherInterface>
  let eventDispatcher: jest.Mocked<EventDispatcherInterface>

  beforeEach(() => {
    uuidRepository = new MockUuidRepository()

    userRepository = {
      save: jest.fn(),
      getById: jest.fn(),
      getByUsername: jest.fn(),
    } as unknown as jest.Mocked<UserRepositoryInterface>

    passwordHasher = {
      hashPassword: jest.fn(),
      verifyPassword: jest.fn(),
    } as jest.Mocked<PasswordHasherInterface>

    eventDispatcher = {
      dispatch: jest.fn(),
    } as jest.Mocked<EventDispatcherInterface>

    userService = new UserService(
      uuidRepository,
      userRepository,
      passwordHasher,
      eventDispatcher,
    )
  })

  describe('createUser', () => {
    it('should create user with generated UUID', async () => {
      uuidRepository.nextUuid(USER_ID)
      passwordHasher.hashPassword.mockResolvedValue(HASHED_PASSWORD)

      const command = new CreateUser({
        username: USERNAME,
        password: PASSWORD,
      })

      const userId = await userService.createUser(command)

      expect(userId.toString()).toBe(USER_ID)
      expect(passwordHasher.hashPassword).toHaveBeenCalledWith(PASSWORD)
      expect(userRepository.save).toHaveBeenCalledTimes(1)
    })

    it('should dispatch UserWasCreated event', async () => {
      uuidRepository.nextUuid(USER_ID)
      passwordHasher.hashPassword.mockResolvedValue(HASHED_PASSWORD)

      const command = new CreateUser({
        username: USERNAME,
        password: PASSWORD,
      })

      await userService.createUser(command)

      const event = new UserWasCreated({
        userId: UserId.fromString(USER_ID),
        username: Username.fromString(USERNAME),
      })

      expect(eventDispatcher.dispatch).toHaveBeenCalledWith(event)
    })
  })
})
