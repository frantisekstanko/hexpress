import { CommandInterface } from '@/Shared/Application/Command/CommandInterface'

export interface CommandBusInterface {
  dispatch<Result>(command: CommandInterface): Promise<Result>
}
