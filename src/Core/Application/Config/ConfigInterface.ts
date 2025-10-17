import { ConfigOption } from '@/Core/Application/Config/ConfigOption'

export interface ConfigInterface {
  get(option: ConfigOption): string
  getAllowedOrigins(): string[]

  isProduction(): boolean
  isDevelopment(): boolean
  isTest(): boolean
}
