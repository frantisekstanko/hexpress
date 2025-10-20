import { UserBuilder } from '@Tests/_support/builders/UserBuilder'
import { FlowTester } from '@Tests/_support/FlowTester'
import { StatusCodes } from 'http-status-codes'
import { Assertion } from '@/Core/Domain/Assert/Assertion'
import { PasswordHasherInterface } from '@/User/Application/PasswordHasherInterface'
import { Services } from '@/User/Application/Services'

const USER_ID = '4c4a26fb-ce83-4059-bc12-cde09e522665'
const USERNAME = 'cooluser'
const PASSWORD = 'password123'
const WRONG_PASSWORD = 'wrongpassword'

describe('Login Flow', () => {
  const tester = FlowTester.setup()
  let passwordHasher: PasswordHasherInterface

  beforeEach(() => {
    passwordHasher = tester.container.get(Services.PasswordHasherInterface)
  })

  it('should login successfully and return JWT tokens', async () => {
    const hashedPassword = await passwordHasher.hashPassword(PASSWORD)

    const user = UserBuilder.create({
      userId: USER_ID,
      username: USERNAME,
      hashedPassword: hashedPassword,
    })

    await tester.createUser(
      user.getUserId().toString(),
      user.toStorage().username,
      user.toStorage().password,
    )

    const response = await tester.request.post('/api/v1/login').send({
      username: USERNAME,
      password: PASSWORD,
    })

    expect(response.status).toBe(StatusCodes.OK)

    Assertion.string(response.body.accessToken)
    Assertion.string(response.body.refreshToken)

    const refreshTokens = await tester.database.query(
      'SELECT * FROM refresh_tokens',
    )
    expect(refreshTokens).toHaveLength(1)
    expect(refreshTokens[0].userId).toBe(USER_ID)
  })

  it('should return 401 with invalid username', async () => {
    const response = await tester.request.post('/api/v1/login').send({
      username: 'nonexistent',
      password: 'password123',
    })

    expect(response.status).toBe(StatusCodes.UNAUTHORIZED)
    expect(response.body).toHaveProperty('error', 'Invalid credentials')

    const refreshTokens = await tester.database.query(
      'SELECT * FROM refresh_tokens',
    )
    expect(refreshTokens).toHaveLength(0)
  })

  it('should return 401 with invalid password', async () => {
    const hashedPassword = await passwordHasher.hashPassword('password123')
    const user = UserBuilder.create({
      userId: USER_ID,
      username: USERNAME,
      hashedPassword: hashedPassword,
    })

    await tester.createUser(
      user.getUserId().toString(),
      user.toStorage().username,
      user.toStorage().password,
    )

    const response = await tester.request.post('/api/v1/login').send({
      username: USERNAME,
      password: WRONG_PASSWORD,
    })

    expect(response.status).toBe(StatusCodes.UNAUTHORIZED)
    expect(response.body).toHaveProperty('error', 'Invalid credentials')

    const refreshTokens = await tester.database.query(
      'SELECT * FROM refresh_tokens',
    )
    expect(refreshTokens).toHaveLength(0)
  })

  it('should return 401 when username is missing', async () => {
    const response = await tester.request.post('/api/v1/login').send({
      password: 'password123',
    })

    expect(response.status).toBe(StatusCodes.BAD_REQUEST)
  })

  it('should return 400 when password is missing', async () => {
    const response = await tester.request.post('/api/v1/login').send({
      username: 'testuser',
    })

    expect(response.status).toBe(StatusCodes.BAD_REQUEST)
  })
})
