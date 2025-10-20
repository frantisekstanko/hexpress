import { ConfigInterface } from '@/Core/Application/Config/ConfigInterface'
import { LoggerInterface } from '@/Core/Application/LoggerInterface'
import { ConnectionValidatorInterface } from '@/Core/Application/WebSocket/ConnectionValidatorInterface'

export class ConnectionValidator implements ConnectionValidatorInterface {
  constructor(
    private readonly logger: LoggerInterface,
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
