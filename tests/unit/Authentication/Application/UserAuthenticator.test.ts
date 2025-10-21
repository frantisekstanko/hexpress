import { UserAuthenticationService } from '@/Authentication/Application/UserAuthenticationService'
import { InvalidCredentialsException } from '@/Authentication/Domain/InvalidCredentialsException'
import { PasswordHasherInterface } from '@/User/Application/PasswordHasherInterface'
import { User } from '@/User/Domain/User'
import { UserRepositoryInterface } from '@/User/Domain/UserRepositoryInterface'

const USER_ID = '93906a9e-250e-4151-b2e7-4f0ffcb3e11f'
const USERNAME = 'testuser'
const PASSWORD = 'password123'
const HASHED_PASSWORD = 'hashed_password123'

describe('UserAuthenticationService', () => {
  let userAuthenticationService: UserAuthenticationService
  let mockUserRepository: jest.Mocked<UserRepositoryInterface>
  let mockPasswordHasher: jest.Mocked<PasswordHasherInterface>

  beforeEach(() => {
    mockUserRepository = {
      getByUsername: jest.fn(),
      save: jest.fn(),
      getById: jest.fn(),
    } as unknown as jest.Mocked<UserRepositoryInterface>

    mockPasswordHasher = {
      hashPassword: jest.fn(),
      verifyPassword: jest.fn(),
    } as jest.Mocked<PasswordHasherInterface>

    userAuthenticationService = new UserAuthenticationService(
      mockUserRepository,
      mockPasswordHasher,
    )
  })

  describe('authenticate', () => {
    it('should authenticate user with valid credentials', async () => {
      const user = User.fromPersistence({
        userId: USER_ID,
        username: USERNAME,
        hashedPassword: HASHED_PASSWORD,
      })
      mockUserRepository.getByUsername.mockResolvedValue(user)
      mockPasswordHasher.verifyPassword.mockResolvedValue(true)

      const userId = await userAuthenticationService.authenticate(
        USERNAME,
        PASSWORD,
      )

      expect(userId.toString()).toBe(USER_ID)
      expect(mockUserRepository.getByUsername).toHaveBeenCalledWith(USERNAME)
      expect(mockPasswordHasher.verifyPassword).toHaveBeenCalledWith(
        PASSWORD,
        HASHED_PASSWORD,
      )
    })

    it('should throw InvalidCredentialsException when password does not match', async () => {
      const user = User.fromPersistence({
        userId: USER_ID,
        username: USERNAME,
        hashedPassword: HASHED_PASSWORD,
      })
      mockUserRepository.getByUsername.mockResolvedValue(user)
      mockPasswordHasher.verifyPassword.mockResolvedValue(false)

      await expect(
        userAuthenticationService.authenticate(USERNAME, 'wrong-password'),
      ).rejects.toThrow(InvalidCredentialsException)
      await expect(
        userAuthenticationService.authenticate(USERNAME, 'wrong-password'),
      ).rejects.toThrow('Invalid credentials')
    })

    it('should propagate error when user is not found', async () => {
      mockUserRepository.getByUsername.mockRejectedValue(
        new Error('User not found'),
      )

      await expect(
        userAuthenticationService.authenticate(USERNAME, PASSWORD),
      ).rejects.toThrow('User not found')
    })
  })
})
