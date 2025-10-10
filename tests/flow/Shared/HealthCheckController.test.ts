import { FlowTester } from '@Tests/_support/FlowTester'
import { StatusCodes } from 'http-status-codes'

describe('HealthCheck Flow', () => {
  const tester = FlowTester.setup()

  it('should return healthy status when all checks pass', async () => {
    const response = await tester.request.get('/health')
    expect(response.status).toBe(StatusCodes.OK)
    const data = response.body
    expect(data).toHaveProperty('timestamp')
    expect(data).toHaveProperty('uptime')
    expect(data).toHaveProperty('environment')
    expect(data).toHaveProperty('version')
    expect(data.checks.database.status).toBe('ok')
    expect(data.checks.database).toHaveProperty('responseTime')
  })
})
