import { NextFunction, Request, Response } from 'express'

export interface ControllerInterface {
  handle(
    request: Request,
    response: Response,
    next: NextFunction,
  ): void | Promise<void>
}
