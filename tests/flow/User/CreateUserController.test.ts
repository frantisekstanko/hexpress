import { FlowTester } from '@Tests/_support/FlowTester'
import { StatusCodes } from 'http-status-codes'

const USERNAME = 'new user to be created'

describe('CreateUser Flow', () => {
  const tester = FlowTester.setup()

  it('should return 400 when request body is missing', async () => {
    const response = await tester.request.post('/api/v1/user')

    expect(response.status).toBe(StatusCodes.BAD_REQUEST)
  })

  it('should return 400 when username is missing', async () => {
    const response = await tester.request
      .post('/api/v1/user')
      .send({ password: 'password123' })

    expect(response.status).toBe(StatusCodes.BAD_REQUEST)
    expect(response.body).toEqual({
      error: 'Username is required',
    })
  })

  it('should return 400 when username is not a string', async () => {
    const response = await tester.request
      .post('/api/v1/user')
      .send({ username: 123, password: 'password123' })

    expect(response.status).toBe(StatusCodes.BAD_REQUEST)
    expect(response.body).toEqual({
      error: 'Username is required',
    })
  })

  it('should return 400 when password is missing', async () => {
    const response = await tester.request
      .post('/api/v1/user')
      .send({ username: USERNAME })

    expect(response.status).toBe(StatusCodes.BAD_REQUEST)
    expect(response.body).toEqual({
      error: 'Password is required',
    })
  })

  it('should return 400 when password is not a string', async () => {
    const response = await tester.request
      .post('/api/v1/user')
      .send({ username: USERNAME, password: 123 })

    expect(response.status).toBe(StatusCodes.BAD_REQUEST)
    expect(response.body).toEqual({
      error: 'Password is required',
    })
  })

  it('should return 400 when password is too short', async () => {
    const response = await tester.request
      .post('/api/v1/user')
      .send({ username: USERNAME, password: 'short' })

    expect(response.status).toBe(StatusCodes.BAD_REQUEST)
    expect(response.body).toEqual({
      error: 'Password must be at least 8 characters long',
    })
  })

  it('should create user successfully', async () => {
    const response = await tester.request
      .post('/api/v1/user')
      .send({ username: USERNAME, password: 'password123' })

    expect(response.status).toBe(StatusCodes.CREATED)
    const data = response.body
    expect(data).toHaveProperty('userId')
    expect(typeof data.userId).toBe('string')

    const users = await tester.transaction.query('SELECT * FROM users')
    expect(users).toHaveLength(1)
    expect(users[0].username).toBe(USERNAME)
  })
})
