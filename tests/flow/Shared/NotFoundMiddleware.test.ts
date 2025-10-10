import { FlowTester } from '@Tests/_support/FlowTester'
import { StatusCodes } from 'http-status-codes'

describe('NotFoundMiddleware', () => {
  const tester = FlowTester.setup()

  it('should return 404 for non-existent route', async () => {
    const response = await tester.request.get('/api/v1/non-existent-route')

    expect(response.status).toBe(StatusCodes.NOT_FOUND)
    expect(response.body).toEqual({ error: 'Route not found' })
  })
})
