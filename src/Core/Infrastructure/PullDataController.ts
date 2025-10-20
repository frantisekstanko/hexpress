import { Request, Response } from 'express'
import { ApplicationVersionRepositoryInterface } from '@/Core/Application/ApplicationVersionRepositoryInterface'
import { ControllerInterface } from '@/Core/Application/Controller/ControllerInterface'

export class PullDataController implements ControllerInterface {
  constructor(
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
