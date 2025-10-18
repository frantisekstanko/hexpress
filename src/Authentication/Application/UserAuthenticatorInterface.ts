import { UserId } from '@/Core/Domain/UserId'

export interface UserAuthenticatorInterface {
  authenticate(username: string, password: string): Promise<UserId>
}
