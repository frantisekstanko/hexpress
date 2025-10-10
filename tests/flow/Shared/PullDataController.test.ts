import { FlowTester } from '@Tests/_support/FlowTester'
import { StatusCodes } from 'http-status-codes'

describe('PullDataController', () => {
  const tester = FlowTester.setup()

  it('should return version and current time', async () => {
    const response = await tester.request.get('/api/v1/pull')

    expect(response.status).toBe(StatusCodes.OK)
    expect(response.body).toHaveProperty('version')
    expect(response.body).toHaveProperty('timeNow')
    expect(typeof response.body.version).toBe('string')
    expect(typeof response.body.timeNow).toBe('number')
    expect(response.body.timeNow).toBeGreaterThan(0)
    expect(response.body.timeNow % 1000).toBe(0)
  })
})
