import * as fs from 'node:fs'
import { inject, injectable } from 'inversify'
import pino from 'pino'
import { ConfigInterface } from '@/Core/Application/Config/ConfigInterface'
import { ConfigOption } from '@/Core/Application/Config/ConfigOption'
import { LoggerInterface } from '@/Core/Application/LoggerInterface'
import { Symbols } from '@/Core/Application/Symbols'

@injectable()
export class Logger implements LoggerInterface {
  private logger: pino.Logger
  private logsDir: string

  constructor(
    @inject(Symbols.ConfigInterface) private config: ConfigInterface,
  ) {
    this.logsDir = this.config.get(ConfigOption.LOGS_DIR)

    if (this.config.isTest()) {
      this.logger = pino({
        level: 'silent',
      })
      return
    }

    if (this.config.isDevelopment()) {
      this.logger = pino({
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
          },
        },
      })
      return
    }

    if (!fs.existsSync(this.logsDir)) {
      try {
        fs.mkdirSync(this.logsDir)
      } catch (error) {
        console.error('Failed to create logs directory:', error)
        throw new Error('Failed to create logs directory')
      }
    }

    this.logger = pino(
      {
        level: this.config.get(ConfigOption.LOG_LEVEL),
        formatters: {
          level: (label) => {
            return { level: label }
          },
        },
      },
      pino.destination({
        dest: `${this.logsDir}/backend.log`,
        sync: false,
      }),
    )
  }

  public info(message: string, context?: Record<string, unknown>): void {
    this.logger.info(context ?? {}, message)
  }

  public warning(message: string, context?: Record<string, unknown>): void {
    this.logger.warn(context ?? {}, message)
  }

  public error(message: string, error?: unknown): void {
    if (error instanceof Error) {
      this.logger.error({ err: error }, message)
      return
    }

    if (error) {
      this.logger.error({ error }, message)
      return
    }

    this.logger.error(message)
  }

  public debug(message: string, context?: Record<string, unknown>): void {
    this.logger.debug(context ?? {}, message)
  }

  public close(): void {
    this.logger.flush()
  }
}
