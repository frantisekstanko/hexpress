import { ConfigInterface } from '@/Core/Application/Config/ConfigInterface'
import { HeartbeatManager } from '@/Core/Infrastructure/WebSocket/HeartbeatManager'

describe('HeartbeatManager', () => {
  let heartbeatManager: HeartbeatManager
  let mockConfig: jest.Mocked<ConfigInterface>

  beforeEach(() => {
    mockConfig = {
      get: jest.fn(),
    } as unknown as jest.Mocked<ConfigInterface>

    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('constructor', () => {
    it('should throw error when heartbeat interval is not a number', () => {
      mockConfig.get.mockReturnValue('invalid')

      expect(() => new HeartbeatManager(mockConfig)).toThrow(
        'WebSocket heartbeat interval must be a number',
      )
    })

    it('should throw error when heartbeat interval is zero', () => {
      mockConfig.get.mockReturnValue('0')

      expect(() => new HeartbeatManager(mockConfig)).toThrow(
        'WebSocket heartbeat interval must be greater than 0',
      )
    })

    it('should throw error when heartbeat interval is negative', () => {
      mockConfig.get.mockReturnValue('-100')

      expect(() => new HeartbeatManager(mockConfig)).toThrow(
        'WebSocket heartbeat interval must be greater than 0',
      )
    })

    it('should create manager with valid interval', () => {
      mockConfig.get.mockReturnValue('5000')

      expect(() => new HeartbeatManager(mockConfig)).not.toThrow()
    })
  })

  describe('startHeartbeat', () => {
    it('should call callback at configured interval', () => {
      mockConfig.get.mockReturnValue('1000')
      heartbeatManager = new HeartbeatManager(mockConfig)

      const callback = jest.fn()
      heartbeatManager.startHeartbeat(callback)

      expect(callback).not.toHaveBeenCalled()

      jest.advanceTimersByTime(1000)
      expect(callback).toHaveBeenCalledTimes(1)

      jest.advanceTimersByTime(1000)
      expect(callback).toHaveBeenCalledTimes(2)

      jest.advanceTimersByTime(1000)
      expect(callback).toHaveBeenCalledTimes(3)
    })

    it('should return interval handle', () => {
      mockConfig.get.mockReturnValue('1000')
      heartbeatManager = new HeartbeatManager(mockConfig)

      const callback = jest.fn()
      const interval = heartbeatManager.startHeartbeat(callback)

      expect(interval).toBeDefined()
      clearInterval(interval)
    })
  })
})
