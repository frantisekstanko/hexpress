import { join } from 'node:path'
import { ApplicationVersionRepositoryInterface } from '@/Core/Application/ApplicationVersionRepositoryInterface'
import { FilesystemInterface } from '@/Core/Application/FilesystemInterface'
import { Assertion } from '@/Core/Domain/Assert/Assertion'
import { RuntimeException } from '@/Core/Domain/Exception/RuntimeException'

export class ApplicationVersionRepository
  implements ApplicationVersionRepositoryInterface
{
  private readonly packageJsonPath = join(process.cwd(), 'package.json')

  constructor(private readonly filesystem: FilesystemInterface) {}

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
