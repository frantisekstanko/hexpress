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
        hashedPassword: PASSWORD,
      })

      const events = user.releaseEvents()

      expect(events).toHaveLength(1)
      expect(events[0]).toBeInstanceOf(UserWasCreated)
      expect(events[0].getEventName()).toBe('UserWasCreated')
    })
  })

  describe('fromPersistence', () => {
    it('should create user from valid persistence data', () => {
      const user = User.fromPersistence({
        userId: USER_ID,
        username: USERNAME,
        hashedPassword: PASSWORD,
      })

      expect(user.getUserId().toString()).toBe(USER_ID)
      expect(user.getUsername()).toBe(USERNAME)
      expect(user.getPasswordHash()).toBe(PASSWORD)
    })
  })
})
