import { CommandInterface } from '@/Shared/Application/CommandInterface'

export class CreateUser implements CommandInterface {
  private readonly username: string
  private readonly password: string

  constructor(args: { username: string; password: string }) {
    this.username = args.username
    this.password = args.password
  }

  getUsername(): string {
    return this.username
  }

  getPassword(): string {
    return this.password
  }
}
