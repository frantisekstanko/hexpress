import { DurationParserInterface } from '@/Authentication/Application/DurationParserInterface'
import { TokenCodecInterface } from '@/Authentication/Application/TokenCodecInterface'
import { TokenGeneratorInterface } from '@/Authentication/Application/TokenGeneratorInterface'
import { RefreshTokenRepositoryInterface } from '@/Authentication/Domain/RefreshTokenRepositoryInterface'
import { createServiceToken } from '@/Core/Application/ServiceToken'

export const Services = {
  RefreshTokenRepositoryInterface:
    createServiceToken<RefreshTokenRepositoryInterface>(
      'RefreshTokenRepositoryInterface',
    ),
  TokenCodecInterface: createServiceToken<TokenCodecInterface>(
    'TokenCodecInterface',
  ),
  DurationParserInterface: createServiceToken<DurationParserInterface>(
    'DurationParserInterface',
  ),
  TokenGeneratorInterface: createServiceToken<TokenGeneratorInterface>(
    'TokenGeneratorInterface',
  ),
}
