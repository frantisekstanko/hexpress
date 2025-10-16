import { AdapterTester } from '@Tests/_support/AdapterTester'
import { NextFunction, Request, Response } from 'express'
import { LoginService } from '@/Authentication/Application/LoginService'
import { AuthenticatedRequest } from '@/Authentication/Infrastructure/AuthenticatedRequest'
import { AuthenticationMiddleware } from '@/Authentication/Infrastructure/AuthenticationMiddleware'
import { LoggerInterface } from '@/Shared/Application/LoggerInterface'
import { Symbols } from '@/Shared/Application/Symbols'
import { UserId } from '@/Shared/Domain/UserId'

const USER_ID = '5e7aa93a-5f28-43a1-b7db-8f5adc394fe7'

describe('AuthenticationMiddleware', () => {
  const tester = AdapterTester.setup()
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let mockNext: NextFunction
  let authMiddleware: AuthenticationMiddleware

  beforeEach(() => {
    const loginService = tester.container.get<LoginService>(
      Symbols.LoginService,
    )
    const logger = tester.container.get<LoggerInterface>(
      Symbols.LoggerInterface,
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
    it('should return 401 when authorization header is missing', async () => {
      await authMiddleware.authenticate(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized' })
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should return 401 when authorization header does not match Bearer pattern', async () => {
      mockRequest.headers = { authorization: 'InvalidFormat' }

      await authMiddleware.authenticate(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized' })
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should return 401 when authorization header has Bearer without token', async () => {
      mockRequest.headers = { authorization: 'Bearer ' }

      await authMiddleware.authenticate(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized' })
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should return 401 when token verification fails', async () => {
      mockRequest.headers = { authorization: 'Bearer invalid-token' }

      await authMiddleware.authenticate(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(mockResponse.status).toHaveBeenCalledWith(401)
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Unauthorized' })
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should authenticate successfully and call next with valid token', async () => {
      const loginService = tester.container.get<LoginService>(
        Symbols.LoginService,
      )
      const userId = UserId.fromString(USER_ID)
      const tokenPair = await loginService.generateTokenPair(userId)

      mockRequest.headers = { authorization: `Bearer ${tokenPair.accessToken}` }

      await authMiddleware.authenticate(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(mockNext).toHaveBeenCalled()
      expect(mockResponse.status).not.toHaveBeenCalled()
      expect(
        (mockRequest as AuthenticatedRequest).locals.loggedInUserRepository,
      ).toBeDefined()
    })
  })
})
