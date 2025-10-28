import cors from 'cors'
import { NextFunction, Request, Response } from 'express'
import { AllowedOrigins } from '@/Core/Application/Config/AllowedOrigins'
import { ConfigInterface } from '@/Core/Application/Config/ConfigInterface'
import { CorsMiddleware } from '@/Core/Infrastructure/CorsMiddleware'

jest.mock('cors')

describe('CorsMiddleware', () => {
  let mockConfig: jest.Mocked<ConfigInterface>
  let mockCorsHandler: jest.Mock
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let mockNext: NextFunction

  beforeEach(() => {
    jest.clearAllMocks()

    mockCorsHandler = jest.fn()
    ;(cors as unknown as jest.Mock).mockReturnValue(mockCorsHandler)

    mockConfig = {
      get: jest.fn(),
      getAllowedOrigins: jest.fn(),
      isProduction: jest.fn(),
      isDevelopment: jest.fn(),
      isTest: jest.fn(),
    }

    mockRequest = {}
    mockResponse = {}
    mockNext = jest.fn() as NextFunction
  })

  describe('constructor', () => {
    it('should create cors middleware with origin callback', () => {
      mockConfig.getAllowedOrigins.mockReturnValue(
        AllowedOrigins.fromCommaSeparatedString('https://insane.local'),
      )

      new CorsMiddleware(mockConfig)

      expect(cors).toHaveBeenCalledWith({
        origin: expect.any(Function),
        credentials: true,
      })
    })

    it('should allow request without origin in development mode', () => {
      mockConfig.getAllowedOrigins.mockReturnValue(
        AllowedOrigins.fromCommaSeparatedString('https://example.com'),
      )
      mockConfig.isDevelopment.mockReturnValue(true)

      new CorsMiddleware(mockConfig)

      const corsOptions = (cors as unknown as jest.Mock).mock.calls[0][0]
      const callback = jest.fn()

      corsOptions.origin(undefined, callback)

      expect(callback).toHaveBeenCalledWith(null, true)
    })

    it('should allow request without origin in production mode', () => {
      mockConfig.getAllowedOrigins.mockReturnValue(
        AllowedOrigins.fromCommaSeparatedString('https://example.com'),
      )
      mockConfig.isDevelopment.mockReturnValue(false)

      new CorsMiddleware(mockConfig)

      const corsOptions = (cors as unknown as jest.Mock).mock.calls[0][0]
      const callback = jest.fn()

      corsOptions.origin(undefined, callback)

      expect(callback).toHaveBeenCalledWith(null, true)
    })

    it('should allow request from allowed origin', () => {
      mockConfig.getAllowedOrigins.mockReturnValue(
        AllowedOrigins.fromCommaSeparatedString(
          'https://insane.local,https://admin.insane.local',
        ),
      )

      new CorsMiddleware(mockConfig)

      const corsOptions = (cors as unknown as jest.Mock).mock.calls[0][0]
      const callback = jest.fn()

      corsOptions.origin('https://insane.local', callback)

      expect(callback).toHaveBeenCalledWith(null, true)
    })

    it('should reject request from disallowed origin', () => {
      mockConfig.getAllowedOrigins.mockReturnValue(
        AllowedOrigins.fromCommaSeparatedString('https://notinsane.local'),
      )

      new CorsMiddleware(mockConfig)

      const corsOptions = (cors as unknown as jest.Mock).mock.calls[0][0]
      const callback = jest.fn()

      corsOptions.origin('https://malicious.com', callback)

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Not allowed by CORS: https://malicious.com',
        }),
      )
    })

    it('should allow empty string origin in any mode', () => {
      mockConfig.getAllowedOrigins.mockReturnValue(
        AllowedOrigins.fromCommaSeparatedString('https://example.com'),
      )
      mockConfig.isDevelopment.mockReturnValue(false)

      new CorsMiddleware(mockConfig)

      const corsOptions = (cors as unknown as jest.Mock).mock.calls[0][0]
      const callback = jest.fn()

      corsOptions.origin('', callback)

      expect(callback).toHaveBeenCalledWith(null, true)
    })
  })

  describe('handle', () => {
    it('should call cors handler with request, response, and next', () => {
      mockConfig.getAllowedOrigins.mockReturnValue(
        AllowedOrigins.fromCommaSeparatedString('https://insane.local'),
      )

      const middleware = new CorsMiddleware(mockConfig)

      middleware.handle(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(mockCorsHandler).toHaveBeenCalledWith(
        mockRequest,
        mockResponse,
        mockNext,
      )
    })
  })
})
