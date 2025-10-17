import { injectable } from 'inversify'
import { ConfigInterface } from '@/Core/Application/Config/ConfigInterface'
import { ConfigOption } from '@/Core/Application/Config/ConfigOption'
import { Assertion } from '@/Core/Domain/Assert/Assertion'

@injectable()
export class Config implements ConfigInterface {
  private readonly configurationValues = {} as Record<string, string>

  constructor() {
    for (const option in ConfigOption) {
      const configurationValue = process.env[option]

      Assertion.string(
        configurationValue,
        `Environment variable ${option} is not set`,
      )

      this.configurationValues[option] = configurationValue
    }
  }

  get(option: ConfigOption): string {
    if (!(option in this.configurationValues)) {
      throw new Error(`Configuration option ${option} is not set`)
    }

    return this.configurationValues[option]
  }

  isProduction(): boolean {
    return this.configurationValues.NODE_ENV === 'production'
  }

  isDevelopment(): boolean {
    return this.configurationValues.NODE_ENV === 'development'
  }

  isTest(): boolean {
    return this.configurationValues.NODE_ENV === 'test'
  }

  getAllowedOrigins(): string[] {
    return this.get(ConfigOption.ALLOWED_ORIGINS).split(',')
  }
}
