import { AllowedOrigins } from '@/Core/Application/Config/AllowedOrigins'
import { ConfigInterface } from '@/Core/Application/Config/ConfigInterface'
import { LoggerInterface } from '@/Core/Application/LoggerInterface'
import { ConnectionValidator } from '@/Core/Infrastructure/WebSocket/ConnectionValidator'

describe('ConnectionValidator', () => {
  let connectionValidator: ConnectionValidator
  let mockLogger: jest.Mocked<LoggerInterface>
  let mockConfig: jest.Mocked<ConfigInterface>

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      warning: jest.fn(),
      debug: jest.fn(),
      close: jest.fn(),
    } as unknown as jest.Mocked<LoggerInterface>

    mockConfig = {
      getAllowedOrigins: jest.fn(),
    } as unknown as jest.Mocked<ConfigInterface>

    connectionValidator = new ConnectionValidator(mockLogger, mockConfig)
  })

  describe('isOriginValid', () => {
    it('should return true for valid origin', () => {
      const allowedOrigins = AllowedOrigins.fromCommaSeparatedString(
        'http://localhost:3000',
      )
      mockConfig.getAllowedOrigins.mockReturnValue(allowedOrigins)

      const result = connectionValidator.isOriginValid('http://localhost:3000')

      expect(result).toBe(true)
      expect(mockLogger.info).not.toHaveBeenCalled()
    })

    it('should return false for invalid origin', () => {
      const allowedOrigins = AllowedOrigins.fromCommaSeparatedString(
        'http://localhost:3000',
      )
      mockConfig.getAllowedOrigins.mockReturnValue(allowedOrigins)

      const result = connectionValidator.isOriginValid('http://malicious.com')

      expect(result).toBe(false)
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Connection refused due to invalid origin: http://malicious.com',
      )
    })

    it('should return false for undefined origin', () => {
      const allowedOrigins = AllowedOrigins.fromCommaSeparatedString(
        'http://localhost:3000',
      )
      mockConfig.getAllowedOrigins.mockReturnValue(allowedOrigins)

      const result = connectionValidator.isOriginValid(undefined)

      expect(result).toBe(false)
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Connection refused due to invalid origin: unknown',
      )
    })

    it('should return true when origin is in allowed list', () => {
      const allowedOrigins = AllowedOrigins.fromCommaSeparatedString(
        'http://localhost:3000,http://example.com',
      )
      mockConfig.getAllowedOrigins.mockReturnValue(allowedOrigins)

      const result = connectionValidator.isOriginValid('http://example.com')

      expect(result).toBe(true)
    })
  })
})
