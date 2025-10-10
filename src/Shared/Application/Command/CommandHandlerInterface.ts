export interface CommandHandlerInterface<Command, Result> {
  handle(command: Command): Promise<Result>
}
