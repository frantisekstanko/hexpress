import { AdapterTester } from '@Tests/_support/AdapterTester'
import { NextFunction, Request, Response } from 'express'
import { LoginService } from '@/Authentication/Application/LoginService'
import { AuthenticatedRequest } from '@/Authentication/Infrastructure/AuthenticatedRequest'
import { AuthenticationMiddleware } from '@/Authentication/Infrastructure/AuthenticationMiddleware'
import { LoggerInterface } from '@/Core/Application/LoggerInterface'
import { Services } from '@/Core/Application/Services'
import { UserId } from '@/Core/Domain/UserId'

const USER_ID = '5e7aa93a-5f28-43a1-b7db-8f5adc394fe7'

describe('AuthenticationMiddleware', () => {
  const tester = AdapterTester.setup()
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let mockNext: NextFunction
  let authMiddleware: AuthenticationMiddleware

  beforeEach(() => {
    const loginService = tester.container.get<LoginService>(LoginService)
    const logger = tester.container.get<LoggerInterface>(
      Services.LoggerInterface,
    )

    authMiddleware = new AuthenticationMiddleware(loginService, logger)

    mockRequest = {
      headers: {},
    }

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      locals: {},
    }

    mockNext = jest.fn()
  })

  describe('authenticate', () => {
    it('should return 401 when authorization header is missing', () => {
      authMiddleware.authenticate(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized' })
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should return 401 when authorization header does not match Bearer pattern', () => {
      mockRequest.headers = { authorization: 'InvalidFormat' }

      authMiddleware.authenticate(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized' })
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should return 401 when authorization header has Bearer without token', () => {
      mockRequest.headers = { authorization: 'Bearer ' }

      authMiddleware.authenticate(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized' })
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should return 401 when token verification fails', () => {
      mockRequest.headers = { authorization: 'Bearer invalid-token' }

      authMiddleware.authenticate(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized' })
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should authenticate successfully and call next with valid token', async () => {
      const loginService = tester.container.get<LoginService>(LoginService)
      const userId = UserId.fromString(USER_ID)
      const tokenPair = await loginService.generateTokenPair(userId)

      mockRequest.headers = { authorization: `Bearer ${tokenPair.accessToken}` }

      authMiddleware.authenticate(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(mockNext).toHaveBeenCalled()
      expect(mockResponse.status).not.toHaveBeenCalled()
      expect(
        (mockRequest as AuthenticatedRequest).locals.authenticatedUser,
      ).toBeDefined()
    })
  })
})
