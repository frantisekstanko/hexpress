import { CommandInterface } from '@/Shared/Application/Command/CommandInterface'

export interface CommandHandlerInterface<Result> {
  handle(command: CommandInterface): Promise<Result>
}
