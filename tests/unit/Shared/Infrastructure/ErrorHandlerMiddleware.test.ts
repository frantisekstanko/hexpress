import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { LoggerInterface } from '@/Core/Application/LoggerInterface'
import { NotFoundException } from '@/Core/Domain/Exception/NotFoundException'
import { RuntimeException } from '@/Core/Domain/Exception/RuntimeException'
import { ErrorHandlerMiddleware } from '@/Core/Infrastructure/ErrorHandlerMiddleware'

describe('ErrorHandlerMiddleware', () => {
  let logger: jest.Mocked<LoggerInterface>
  let middleware: ErrorHandlerMiddleware
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let mockNext: NextFunction

  beforeEach(() => {
    logger = {
      info: jest.fn(),
      warning: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      close: jest.fn(),
    }

    middleware = new ErrorHandlerMiddleware(logger)

    mockRequest = {
      path: '/test/path',
      method: 'GET',
    }

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      sendStatus: jest.fn().mockReturnThis(),
    }

    mockNext = jest.fn() as NextFunction
  })

  it('should handle NotFoundException by logging info and returning 404', () => {
    const error = new NotFoundException('Resource not found')

    middleware.handle(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    )

    expect(logger.info).toHaveBeenCalledWith('Resource not found', {
      message: 'Resource not found',
      path: '/test/path',
      method: 'GET',
    })

    expect(mockResponse.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND)

    expect(logger.error).not.toHaveBeenCalled()
  })

  it('should handle RuntimeException by logging error and returning 500', () => {
    const error = new RuntimeException('Runtime error occurred')

    middleware.handle(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    )

    expect(logger.error).toHaveBeenCalledWith('Runtime error occurred', {
      error: error,
      message: 'Runtime error occurred',
      stack: error.stack,
      path: '/test/path',
      method: 'GET',
    })

    expect(mockResponse.sendStatus).toHaveBeenCalledWith(
      StatusCodes.INTERNAL_SERVER_ERROR,
    )

    expect(logger.info).not.toHaveBeenCalled()
  })

  it('should handle generic Error by logging error and returning 500', () => {
    const error = new Error('Unexpected error')

    middleware.handle(
      error,
      mockRequest as Request,
      mockResponse as Response,
      mockNext,
    )

    expect(logger.error).toHaveBeenCalledWith('Unhandled error occurred', {
      error: error,
      message: 'Unexpected error',
      stack: error.stack,
      path: '/test/path',
      method: 'GET',
    })

    expect(mockResponse.sendStatus).toHaveBeenCalledWith(
      StatusCodes.INTERNAL_SERVER_ERROR,
    )
  })
})
