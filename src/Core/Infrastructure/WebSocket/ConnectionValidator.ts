import { inject, injectable } from 'inversify'
import { ConfigInterface } from '@/Core/Application/Config/ConfigInterface'
import { LoggerInterface } from '@/Core/Application/LoggerInterface'
import { Services } from '@/Core/Application/Services'
import { ConnectionValidatorInterface } from '@/Core/Application/WebSocket/ConnectionValidatorInterface'

@injectable()
export class ConnectionValidator implements ConnectionValidatorInterface {
  constructor(
    @inject(Services.LoggerInterface)
    private readonly logger: LoggerInterface,
    @inject(Services.ConfigInterface)
    private readonly config: ConfigInterface,
  ) {}

  isOriginValid(origin: string | undefined): boolean {
    const allowedOrigins = this.config.getAllowedOrigins()

    if (!allowedOrigins.includes(origin ?? '')) {
      this.logger.info(
        `Connection refused due to invalid origin: ${origin ?? 'unknown'}`,
      )
      return false
    }

    return true
  }
}
