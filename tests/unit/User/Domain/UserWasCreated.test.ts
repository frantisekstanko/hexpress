import { EventLevel } from '@/Core/Domain/Event/EventLevel'
import { EventType } from '@/Core/Domain/Event/EventType'
import { UserId } from '@/Core/Domain/UserId'
import { UserWasCreated } from '@/User/Domain/UserWasCreated'

const USER_ID = '7ed64704-52c7-415e-9ab1-ba02d00d599f'
const USERNAME = 'testuser'

describe('UserWasCreated', () => {
  describe('constructor', () => {
    it('should create event with userId and username', () => {
      const userId = UserId.fromString(USER_ID)
      const event = new UserWasCreated({ userId, username: USERNAME })

      expect(event.getUserId()).toBe(userId)
      expect(event.getUsername()).toBe(USERNAME)
    })
  })

  describe('getEventName', () => {
    it('should return UserWasCreated', () => {
      const userId = UserId.fromString(USER_ID)
      const event = new UserWasCreated({ userId, username: USERNAME })

      expect(event.getEventName()).toBe('UserWasCreated')
    })
  })

  describe('getLevel', () => {
    it('should return INFO level', () => {
      const userId = UserId.fromString(USER_ID)
      const event = new UserWasCreated({ userId, username: USERNAME })

      expect(event.getLevel()).toBe(EventLevel.INFO)
    })
  })

  describe('getLogMessage', () => {
    it('should return formatted log message with userId', () => {
      const userId = UserId.fromString(USER_ID)
      const event = new UserWasCreated({ userId, username: USERNAME })

      expect(event.getLogMessage()).toBe(`User ${USER_ID} was created`)
    })
  })

  describe('getLogContext', () => {
    it('should return context with userId and username', () => {
      const userId = UserId.fromString(USER_ID)
      const event = new UserWasCreated({ userId, username: USERNAME })

      expect(event.getLogContext()).toEqual({
        userId: USER_ID,
        username: USERNAME,
      })
    })
  })

  describe('getEventType', () => {
    it('should return MANUAL event type', () => {
      const userId = UserId.fromString(USER_ID)
      const event = new UserWasCreated({ userId, username: USERNAME })

      expect(event.getEventType()).toBe(EventType.MANUAL)
    })
  })
})
