import { createServiceToken } from '@/Core/Application/ServiceToken'
import { DurationParserInterface } from '@/User/Application/DurationParserInterface'
import { PasswordHasherInterface } from '@/User/Application/PasswordHasherInterface'
import { TokenCodecInterface } from '@/User/Application/TokenCodecInterface'
import { TokenGeneratorInterface } from '@/User/Application/TokenGeneratorInterface'
import { RefreshTokenRepositoryInterface } from '@/User/Domain/RefreshTokenRepositoryInterface'
import { UserRepositoryInterface } from '@/User/Domain/UserRepositoryInterface'

export const Services = {
  PasswordHasherInterface: createServiceToken<PasswordHasherInterface>(
    'PasswordHasherInterface',
  ),
  UserRepositoryInterface: createServiceToken<UserRepositoryInterface>(
    'UserRepositoryInterface',
  ),
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
