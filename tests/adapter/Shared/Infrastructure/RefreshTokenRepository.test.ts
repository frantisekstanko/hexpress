import { AdapterTester } from '@Tests/_support/AdapterTester'
import { TestClock } from '@Tests/_support/TestClock'
import { RefreshTokenRepository } from '@/Authentication/Infrastructure/RefreshTokenRepository'
import { DateTime } from '@/Shared/Domain/Clock/DateTime'
import { UserId } from '@/Shared/Domain/UserId'

const USER_ID = 'e3a9f7b2-1c5d-4e8a-9f3b-2d1c5e8a9f3b'
const TOKEN = 'sample-refresh-token-string'
const ANOTHER_TOKEN = 'another-refresh-token-string'

describe('RefreshTokenRepository', () => {
  const tester = AdapterTester.setup()
  let repository: RefreshTokenRepository
  let userId: UserId
  let clock: TestClock
  let oneHourInTheFuture: DateTime
  let oneSecondAgo: DateTime
  let timeNow: DateTime

  beforeEach(() => {
    timeNow = DateTime.parse('2025-10-05 14:30:33')
    clock = new TestClock(timeNow)

    repository = new RefreshTokenRepository(tester.getDatabaseContext(), clock)
    userId = UserId.fromString(USER_ID)
    oneHourInTheFuture = timeNow.advancedBy('1 hour')
    oneSecondAgo = timeNow.retreatedBy('1 second')
  })

  it('should store a refresh token', async () => {
    await repository.store(TOKEN, userId, oneHourInTheFuture)

    const exists = await repository.exists(TOKEN)

    expect(exists).toBe(true)
  })

  it('should return false for non-existent token', async () => {
    const exists = await repository.exists('non-existent-token')

    expect(exists).toBe(false)
  })

  it('should return false for expired token', async () => {
    await repository.store(TOKEN, userId, oneSecondAgo)

    const exists = await repository.exists(TOKEN)

    expect(exists).toBe(false)
  })

  it('should revoke a refresh token', async () => {
    await repository.store(TOKEN, userId, oneHourInTheFuture)

    let exists = await repository.exists(TOKEN)
    expect(exists).toBe(true)

    await repository.revoke(TOKEN)

    exists = await repository.exists(TOKEN)
    expect(exists).toBe(false)
  })

  it('should handle multiple tokens for same user', async () => {
    await repository.store(TOKEN, userId, oneHourInTheFuture)
    await repository.store(ANOTHER_TOKEN, userId, oneHourInTheFuture)

    const firstExists = await repository.exists(TOKEN)
    const secondExists = await repository.exists(ANOTHER_TOKEN)

    expect(firstExists).toBe(true)
    expect(secondExists).toBe(true)
  })

  it('should revoke only specified token', async () => {
    await repository.store(TOKEN, userId, oneHourInTheFuture)
    await repository.store(ANOTHER_TOKEN, userId, oneHourInTheFuture)

    await repository.revoke(TOKEN)

    const firstExists = await repository.exists(TOKEN)
    const secondExists = await repository.exists(ANOTHER_TOKEN)

    expect(firstExists).toBe(false)
    expect(secondExists).toBe(true)
  })
})
