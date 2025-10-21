import { UserId } from '@/Core/Domain/UserId'
import { User } from '@/User/Domain/User'
import { Username } from '@/User/Domain/Username'

export interface UserRepositoryInterface {
  getById(userId: UserId): Promise<User>
  getByUsername(username: Username): Promise<User>
  save(user: User): Promise<void>
}
