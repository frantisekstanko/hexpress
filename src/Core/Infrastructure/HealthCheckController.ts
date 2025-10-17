import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { inject, injectable } from 'inversify'
import { ConfigInterface } from '@/Core/Application/Config/ConfigInterface'
import { ConfigOption } from '@/Core/Application/Config/ConfigOption'
import { ControllerInterface } from '@/Core/Application/Controller/ControllerInterface'
import { DatabaseContextInterface } from '@/Core/Application/Database/DatabaseContextInterface'
import { Symbols } from '@/Core/Application/Symbols'

@injectable()
export class HealthCheckController implements ControllerInterface {
  constructor(
    @inject(Symbols.DatabaseContextInterface)
    private readonly databaseContext: DatabaseContextInterface,
    @inject(Symbols.ConfigInterface)
    private readonly config: ConfigInterface,
  ) {}

  public async handle(_request: Request, response: Response): Promise<void> {
    const healthCheck = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: this.config.get(ConfigOption.NODE_ENV),
      version: process.env.npm_package_version ?? 'unknown',
      checks: {
        database: await this.checkDatabase(),
        memory: process.memoryUsage().heapUsed / 1024,
      },
    }

    response.status(StatusCodes.OK).json(healthCheck)
  }

  private async checkDatabase(): Promise<{
    status: string
    responseTime?: number
    error?: string
  }> {
    try {
      const start = Date.now()
      await this.databaseContext.getCurrentDatabase().query('SELECT 1')
      const responseTime = Date.now() - start

      return {
        status: 'ok',
        responseTime,
      }
    } catch (error) {
      return {
        status: 'error',
        error:
          error instanceof Error ? error.message : 'Unknown database error',
      }
    }
  }
}
