import { join } from 'node:path'
import { inject, injectable } from 'inversify'
import { ApplicationVersionRepositoryInterface } from '@/Shared/Application/ApplicationVersionRepositoryInterface'
import { RuntimeException } from '@/Shared/Application/RuntimeException'
import { Symbols } from '@/Shared/Application/Symbols'
import { Assertion } from '@/Shared/Domain/Assert/Assertion'
import { FilesystemInterface } from '@/Shared/Infrastructure/Filesystem/FilesystemInterface'

@injectable()
export class ApplicationVersionRepository
  implements ApplicationVersionRepositoryInterface
{
  private readonly packageJsonPath = join(process.cwd(), 'package.json')

  constructor(
    @inject(Symbols.FilesystemInterface)
    private readonly filesystem: FilesystemInterface,
  ) {}

  public async getCurrentVersion(): Promise<string> {
    try {
      const content = await this.filesystem.readFile(this.packageJsonPath)
      const packageJson = JSON.parse(content) as unknown

      Assertion.object(packageJson, 'Invalid package.json format')
      Assertion.string(packageJson.version, 'Version is not a string')

      return packageJson.version
    } catch {
      throw new RuntimeException('Error reading package.json version')
    }
  }
}
