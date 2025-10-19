import { createServiceToken } from '@/Core/Application/ServiceToken'
import { PasswordHasherInterface } from '@/User/Application/PasswordHasherInterface'
import { UserRepositoryInterface } from '@/User/Domain/UserRepositoryInterface'

export const Services = {
  PasswordHasherInterface: createServiceToken<PasswordHasherInterface>(
    'PasswordHasherInterface',
  ),
  UserRepositoryInterface: createServiceToken<UserRepositoryInterface>(
    'UserRepositoryInterface',
  ),
}
