import { CommandInterface } from '@/Core/Application/Command/CommandInterface'

export interface CommandBusInterface {
  dispatch<Result>(command: CommandInterface): Promise<Result>
}
