import { AdapterTester } from '@Tests/_support/AdapterTester'
import { UserId } from '@/Shared/Domain/UserId'
import { User } from '@/User/Domain/User'
import { UserNotFoundException } from '@/User/Domain/UserNotFoundException'
import { UserRepository } from '@/User/Infrastructure/UserRepository'

const USER_ID = 'd645cfb8-bfd3-436c-ae7d-0347bcd27d05'
const USERNAME = 'someone that we are going to test with'
const PASSWORD = 'hashedpassword123'

describe('UserRepository', () => {
  const tester = AdapterTester.setup()
  let repository: UserRepository

  beforeEach(() => {
    repository = new UserRepository(tester.getDatabaseContext())
  })

  it('should save and retrieve a user', async () => {
    const newUser = User.create({
      userId: UserId.fromString(USER_ID),
      username: USERNAME,
      password: PASSWORD,
    })

    newUser.releaseEvents()

    await repository.save(newUser)

    const savedUser = await repository.getById(UserId.fromString(USER_ID))

    expect(savedUser.toStorage()).toEqual(newUser.toStorage())
  })

  it('should update an existing user', async () => {
    const newUser = User.create({
      userId: UserId.fromString(USER_ID),
      username: USERNAME,
      password: PASSWORD,
    })

    newUser.releaseEvents()

    await repository.save(newUser)

    const updatedUser = User.fromStorage({
      userId: USER_ID,
      username: 'updatedUsername',
      password: 'newHashedPassword',
    })

    await repository.save(updatedUser)

    const savedUser = await repository.getById(UserId.fromString(USER_ID))

    expect(savedUser.toStorage().username).toBe('updatedUsername')
    expect(savedUser.toStorage().password).toBe('newHashedPassword')
  })

  it('should throw UserNotFoundException when user not found', async () => {
    await expect(
      repository.getById(
        UserId.fromString('905bad6c-fa3e-44f0-9587-0e33996af9ab'),
      ),
    ).rejects.toThrow(UserNotFoundException)
  })
})
