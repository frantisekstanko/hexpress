import * as fs from 'node:fs'
import pino from 'pino'
import { ConfigInterface } from '@/Core/Application/Config/ConfigInterface'
import { ConfigOption } from '@/Core/Application/Config/ConfigOption'
import { Logger } from '@/Core/Infrastructure/Logger'

jest.mock('node:fs')
jest.mock('pino')

describe('Logger', () => {
  let mockConfig: jest.Mocked<ConfigInterface>
  let mockPinoLogger: {
    info: jest.Mock
    warn: jest.Mock
    error: jest.Mock
    debug: jest.Mock
    flush: jest.Mock
  }

  beforeEach(() => {
    jest.clearAllMocks()

    mockPinoLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      flush: jest.fn(),
    }

    ;(pino as unknown as jest.Mock).mockReturnValue(mockPinoLogger)
    ;(pino.destination as jest.Mock) = jest.fn()

    mockConfig = {
      get: jest.fn(),
      getAllowedOrigins: jest.fn(),
      isProduction: jest.fn(),
      isDevelopment: jest.fn(),
      isTest: jest.fn(),
    }
  })

  describe('constructor', () => {
    it('should create silent logger in test mode', () => {
      mockConfig.isTest.mockReturnValue(true)
      mockConfig.get.mockReturnValue('/logs')

      new Logger(mockConfig)

      expect(pino).toHaveBeenCalledWith({
        level: 'silent',
      })
    })

    it('should create pino-pretty logger in development mode', () => {
      mockConfig.isTest.mockReturnValue(false)
      mockConfig.isDevelopment.mockReturnValue(true)
      mockConfig.get.mockReturnValue('/logs')

      new Logger(mockConfig)

      expect(pino).toHaveBeenCalledWith({
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
          },
        },
      })
    })

    it('should create file logger in production mode when logs directory exists', () => {
      mockConfig.isTest.mockReturnValue(false)
      mockConfig.isDevelopment.mockReturnValue(false)
      mockConfig.get.mockImplementation((option: ConfigOption) => {
        if (option === ConfigOption.LOGS_DIR) return '/logs'
        if (option === ConfigOption.LOG_LEVEL) return 'info'
        return ''
      })
      ;(fs.existsSync as jest.Mock).mockReturnValue(true)

      new Logger(mockConfig)

      expect(fs.existsSync).toHaveBeenCalledWith('/logs')
      expect(fs.mkdirSync).not.toHaveBeenCalled()
      expect(pino.destination).toHaveBeenCalledWith({
        dest: '/logs/backend.log',
        sync: false,
      })
    })

    it('should create logs directory in production mode when it does not exist', () => {
      mockConfig.isTest.mockReturnValue(false)
      mockConfig.isDevelopment.mockReturnValue(false)
      mockConfig.get.mockImplementation((option: ConfigOption) => {
        if (option === ConfigOption.LOGS_DIR) return '/logs'
        if (option === ConfigOption.LOG_LEVEL) return 'debug'
        return ''
      })
      ;(fs.existsSync as jest.Mock).mockReturnValue(false)
      ;(fs.mkdirSync as jest.Mock).mockImplementation(() => {})

      new Logger(mockConfig)

      expect(fs.existsSync).toHaveBeenCalledWith('/logs')
      expect(fs.mkdirSync).toHaveBeenCalledWith('/logs')
    })

    it('should throw error when logs directory creation fails', () => {
      mockConfig.isTest.mockReturnValue(false)
      mockConfig.isDevelopment.mockReturnValue(false)
      mockConfig.get.mockReturnValue('/logs')
      ;(fs.existsSync as jest.Mock).mockReturnValue(false)
      ;(fs.mkdirSync as jest.Mock).mockImplementation(() => {
        throw new Error('Permission denied')
      })

      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      expect(() => new Logger(mockConfig)).toThrow(
        'Failed to create logs directory',
      )

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to create logs directory:',
        expect.any(Error),
      )

      consoleErrorSpy.mockRestore()
    })
  })

  describe('logging methods', () => {
    let logger: Logger

    beforeEach(() => {
      mockConfig.isTest.mockReturnValue(true)
      mockConfig.get.mockReturnValue('/logs')
      logger = new Logger(mockConfig)
    })

    describe('info', () => {
      it('should log info message without context', () => {
        logger.info('test message')

        expect(mockPinoLogger.info).toHaveBeenCalledWith({}, 'test message')
      })

      it('should log info message with context', () => {
        const context = { userId: '123', action: 'create' }

        logger.info('test message', context)

        expect(mockPinoLogger.info).toHaveBeenCalledWith(
          context,
          'test message',
        )
      })
    })

    describe('warning', () => {
      it('should log warning message without context', () => {
        logger.warning('warning message')

        expect(mockPinoLogger.warn).toHaveBeenCalledWith({}, 'warning message')
      })

      it('should log warning message with context', () => {
        const context = { resource: 'document' }

        logger.warning('warning message', context)

        expect(mockPinoLogger.warn).toHaveBeenCalledWith(
          context,
          'warning message',
        )
      })
    })

    describe('error', () => {
      it('should log error message without error object', () => {
        logger.error('error message')

        expect(mockPinoLogger.error).toHaveBeenCalledWith('error message')
      })

      it('should log error message with Error object', () => {
        const error = new Error('test error')

        logger.error('error message', error)

        expect(mockPinoLogger.error).toHaveBeenCalledWith(
          { err: error },
          'error message',
        )
      })

      it('should log error message with unknown error type', () => {
        const unknownError = { code: 'ERR_UNKNOWN', detail: 'something' }

        logger.error('error message', unknownError)

        expect(mockPinoLogger.error).toHaveBeenCalledWith(
          { error: unknownError },
          'error message',
        )
      })
    })

    describe('debug', () => {
      it('should log debug message without context', () => {
        logger.debug('debug message')

        expect(mockPinoLogger.debug).toHaveBeenCalledWith({}, 'debug message')
      })

      it('should log debug message with context', () => {
        const context = { trace: 'abc123' }

        logger.debug('debug message', context)

        expect(mockPinoLogger.debug).toHaveBeenCalledWith(
          context,
          'debug message',
        )
      })
    })

    describe('close', () => {
      it('should flush logger', () => {
        logger.close()

        expect(mockPinoLogger.flush).toHaveBeenCalled()
      })
    })
  })
})
