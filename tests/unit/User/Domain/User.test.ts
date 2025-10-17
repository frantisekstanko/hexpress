import { UserId } from '@/Core/Domain/UserId'
import { User } from '@/User/Domain/User'
import { UserWasCreated } from '@/User/Domain/UserWasCreated'

const USER_ID = 'c1d2e3f4-a5b6-4789-8cde-f012345678ab'
const USERNAME = 'testuser'
const PASSWORD = 'hashedpassword'

describe('User', () => {
  describe('create', () => {
    it('should create user and record UserWasCreated event', () => {
      const user = User.create({
        userId: UserId.fromString(USER_ID),
        username: USERNAME,
        password: PASSWORD,
      })

      const events = user.releaseEvents()

      expect(events).toHaveLength(1)
      expect(events[0]).toBeInstanceOf(UserWasCreated)
      expect(events[0].getEventName()).toBe('UserWasCreated')
    })
  })

  describe('fromStorage', () => {
    it('should create user from valid storage data', () => {
      const user = User.fromStorage({
        userId: USER_ID,
        username: USERNAME,
        password: PASSWORD,
      })

      expect(user.toStorage()).toEqual({
        userId: USER_ID,
        username: USERNAME,
        password: PASSWORD,
      })
    })

    it('should throw error when userId is missing', () => {
      expect(() => {
        User.fromStorage({
          username: USERNAME,
          password: PASSWORD,
        })
      }).toThrow('userId must be a string')
    })

    it('should throw error when username is missing', () => {
      expect(() => {
        User.fromStorage({
          userId: USER_ID,
          password: PASSWORD,
        })
      }).toThrow('username must be a string')
    })

    it('should throw error when password is missing', () => {
      expect(() => {
        User.fromStorage({
          userId: USER_ID,
          username: USERNAME,
        })
      }).toThrow('password must be a string')
    })

    it('should throw error when row is not an object', () => {
      expect(() => {
        User.fromStorage(null)
      }).toThrow('Row must be an object')
    })
  })

  describe('toStorage', () => {
    it('should return storage representation', () => {
      const user = User.create({
        userId: UserId.fromString(USER_ID),
        username: USERNAME,
        password: PASSWORD,
      })

      user.releaseEvents()

      const storage = user.toStorage()

      expect(storage).toEqual({
        userId: USER_ID,
        username: USERNAME,
        password: PASSWORD,
      })
    })
  })

  describe('getUserId', () => {
    it('should return user id', () => {
      const user = User.create({
        userId: UserId.fromString(USER_ID),
        username: USERNAME,
        password: PASSWORD,
      })

      const userId = user.getUserId()

      expect(userId.toString()).toBe(USER_ID)
    })
  })
})
