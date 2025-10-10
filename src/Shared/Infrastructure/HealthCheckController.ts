import { Request, Response } from 'express'
import { inject, injectable } from 'inversify'
import { ConfigInterface } from '@/Shared/Application/Config/ConfigInterface'
import { ConfigOption } from '@/Shared/Application/Config/ConfigOption'
import { ControllerInterface } from '@/Shared/Application/Controller/ControllerInterface'
import { DatabaseInterface } from '@/Shared/Application/Database/DatabaseInterface'
import { Symbols } from '@/Shared/Application/Symbols'

@injectable()
export class HealthCheckController implements ControllerInterface {
  constructor(
    @inject(Symbols.DatabaseInterface)
    private readonly database: DatabaseInterface,
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

    response.status(200).json(healthCheck)
  }

  private async checkDatabase(): Promise<{
    status: string
    responseTime?: number
    error?: string
  }> {
    try {
      const start = Date.now()
      await this.database.query('SELECT 1')
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
