import { AdapterTester } from '@Tests/_support/AdapterTester'
import { TestClock } from '@Tests/_support/TestClock'
import { JwtId } from '@/Authentication/Domain/JwtId'
import { RefreshTokenRepository } from '@/Authentication/Infrastructure/RefreshTokenRepository'
import { DateTime } from '@/Core/Domain/Clock/DateTime'
import { UserId } from '@/Core/Domain/UserId'

const USER_ID = 'e3a9f7b2-1c5d-4e8a-9f3b-2d1c5e8a9f3b'
const JTI = JwtId.fromString('9f1ef472-1585-439c-8310-d740cf9a5333')
const ANOTHER_JTI = JwtId.fromString('169d0310-e002-4cda-a184-779acb6eff1a')

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
    await repository.store(JTI, userId, oneHourInTheFuture)

    const exists = await repository.exists(JTI)

    expect(exists).toBe(true)
  })

  it('should return false for non-existent token', async () => {
    const exists = await repository.exists(
      JwtId.fromString('25d787c9-307e-48be-8d7d-97f400d78a88'),
    )

    expect(exists).toBe(false)
  })

  it('should return false for expired token', async () => {
    await repository.store(JTI, userId, oneSecondAgo)

    const exists = await repository.exists(JTI)

    expect(exists).toBe(false)
  })

  it('should revoke a refresh token', async () => {
    await repository.store(JTI, userId, oneHourInTheFuture)

    let exists = await repository.exists(JTI)
    expect(exists).toBe(true)

    await repository.revoke(JTI)

    exists = await repository.exists(JTI)
    expect(exists).toBe(false)
  })

  it('should handle multiple tokens for same user', async () => {
    await repository.store(JTI, userId, oneHourInTheFuture)
    await repository.store(ANOTHER_JTI, userId, oneHourInTheFuture)

    const firstExists = await repository.exists(JTI)
    const secondExists = await repository.exists(ANOTHER_JTI)

    expect(firstExists).toBe(true)
    expect(secondExists).toBe(true)
  })

  it('should revoke only specified token', async () => {
    await repository.store(JTI, userId, oneHourInTheFuture)
    await repository.store(ANOTHER_JTI, userId, oneHourInTheFuture)

    await repository.revoke(JTI)

    const firstExists = await repository.exists(JTI)
    const secondExists = await repository.exists(ANOTHER_JTI)

    expect(firstExists).toBe(false)
    expect(secondExists).toBe(true)
  })
})
