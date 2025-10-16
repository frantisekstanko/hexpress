import { CommandInterface } from '@/Core/Application/Command/CommandInterface'

export interface CommandHandlerInterface<Result> {
  handle(command: CommandInterface): Promise<Result>
}
