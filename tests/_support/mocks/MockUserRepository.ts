import { UserRepositoryInterface } from '@/User/Domain/UserRepositoryInterface'

export class MockUserRepository implements UserRepositoryInterface {
  save = jest.fn()
  getById = jest.fn()
  getByUsername = jest.fn()
}
