import { UserId } from '@/Core/Domain/UserId'
import { User } from '@/User/Domain/User'

export interface UserRepositoryInterface {
  getById(userId: UserId): Promise<User>
  getByUsername(username: string): Promise<User>
  save(user: User): Promise<void>
}
