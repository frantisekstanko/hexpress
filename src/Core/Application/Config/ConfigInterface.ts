import { AllowedOrigins } from '@/Core/Application/Config/AllowedOrigins'
import { ConfigOption } from '@/Core/Application/Config/ConfigOption'

export interface ConfigInterface {
  get(option: ConfigOption): string
  getAllowedOrigins(): AllowedOrigins

  isProduction(): boolean
  isDevelopment(): boolean
  isTest(): boolean
}
