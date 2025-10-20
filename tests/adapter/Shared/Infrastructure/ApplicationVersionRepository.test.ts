import { TestFilesystem } from '@Tests/_support/TestFilesystem'
import { join } from 'node:path'
import { RuntimeException } from '@/Core/Domain/Exception/RuntimeException'
import { ApplicationVersionRepository } from '@/Core/Infrastructure/ApplicationVersionRepository'

describe('ApplicationVersionRepository', () => {
  let repository: ApplicationVersionRepository
  let filesystem: TestFilesystem
  const packageJsonPath = join(process.cwd(), 'package.json')

  beforeEach(() => {
    filesystem = new TestFilesystem()
    repository = new ApplicationVersionRepository(filesystem)
  })

  it('should return current version from package.json', async () => {
    filesystem.setFile(packageJsonPath, JSON.stringify({ version: '1.2.3' }))

    const version = await repository.getCurrentVersion()

    expect(version).toBe('1.2.3')
  })

  it('should throw RuntimeException when file cannot be read', async () => {
    await expect(repository.getCurrentVersion()).rejects.toThrow(
      RuntimeException,
    )
  })

  it('should throw RuntimeException when package.json is invalid', async () => {
    filesystem.setFile(packageJsonPath, 'invalid json')

    await expect(repository.getCurrentVersion()).rejects.toThrow(
      RuntimeException,
    )
  })

  it('should throw RuntimeException when version field is missing', async () => {
    filesystem.setFile(packageJsonPath, JSON.stringify({ name: 'test' }))

    await expect(repository.getCurrentVersion()).rejects.toThrow(
      RuntimeException,
    )
  })

  it('should throw RuntimeException when version is not a string', async () => {
    filesystem.setFile(packageJsonPath, JSON.stringify({ version: 123 }))

    await expect(repository.getCurrentVersion()).rejects.toThrow(
      RuntimeException,
    )
  })
})
