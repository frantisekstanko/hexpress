import { AdapterTester } from '@Tests/_support/AdapterTester'
import { UserId } from '@/Core/Domain/UserId'
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
      hashedPassword: PASSWORD,
    })

    newUser.releaseEvents()

    await repository.save(newUser)

    const savedUser = await repository.getById(UserId.fromString(USER_ID))

    expect(savedUser.getUserId().toString()).toBe(USER_ID)
    expect(savedUser.getUsername()).toBe(USERNAME)
    expect(savedUser.getPasswordHash()).toBe(PASSWORD)
  })

  it('should update an existing user', async () => {
    const newUser = User.create({
      userId: UserId.fromString(USER_ID),
      username: USERNAME,
      hashedPassword: PASSWORD,
    })

    newUser.releaseEvents()

    await repository.save(newUser)

    const updatedUser = User.fromPersistence({
      userId: USER_ID,
      username: 'updatedUsername',
      hashedPassword: 'newHashedPassword',
    })

    await repository.save(updatedUser)

    const savedUser = await repository.getById(UserId.fromString(USER_ID))

    expect(savedUser.getUserId().toString()).toBe(USER_ID)
    expect(savedUser.getUsername()).toBe('updatedUsername')
    expect(savedUser.getPasswordHash()).toBe('newHashedPassword')
  })

  it('should throw UserNotFoundException when user not found', async () => {
    await expect(
      repository.getById(
        UserId.fromString('905bad6c-fa3e-44f0-9587-0e33996af9ab'),
      ),
    ).rejects.toThrow(UserNotFoundException)
  })
})
