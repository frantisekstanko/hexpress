import { Request, Response } from 'express'
import { inject } from 'inversify'
import { ApplicationVersionRepositoryInterface } from '@/Core/Application/ApplicationVersionRepositoryInterface'
import { ControllerInterface } from '@/Core/Application/Controller/ControllerInterface'
import { Symbols } from '@/Core/Application/Symbols'

export class PullDataController implements ControllerInterface {
  constructor(
    @inject(Symbols.ApplicationVersionRepositoryInterface)
    private readonly applicationVersionRepository: ApplicationVersionRepositoryInterface,
  ) {}

  public async handle(_request: Request, response: Response): Promise<void> {
    const timeNow = Math.floor(Date.now() / 1000)

    const version = await this.applicationVersionRepository.getCurrentVersion()

    response.json({
      version,
      timeNow: timeNow * 1000,
    })
  }
}
