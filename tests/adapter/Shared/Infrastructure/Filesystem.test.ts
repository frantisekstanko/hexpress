import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { Filesystem } from '@/Shared/Infrastructure/Filesystem/Filesystem'

describe('Filesystem', () => {
  let filesystem: Filesystem
  let testDir: string
  let testFilePath: string

  beforeEach(async () => {
    filesystem = new Filesystem()
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'filesystem-test-'))
    testFilePath = path.join(testDir, 'test-file.txt')
  })

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true })
  })

  describe('fileExists', () => {
    it('should return true when file exists', async () => {
      await fs.writeFile(testFilePath, 'test content')

      const exists = await filesystem.fileExists(testFilePath)

      expect(exists).toBe(true)
    })

    it('should return false when file does not exist', async () => {
      const exists = await filesystem.fileExists(
        path.join(testDir, 'nonexistent.txt'),
      )

      expect(exists).toBe(false)
    })
  })

  describe('readFile', () => {
    it('should read file content', async () => {
      const testContent = 'Hello, World!'
      await fs.writeFile(testFilePath, testContent)

      const content = await filesystem.readFile(testFilePath)

      expect(content).toBe(testContent)
    })

    it('should throw error when file does not exist', async () => {
      await expect(
        filesystem.readFile(path.join(testDir, 'nonexistent.txt')),
      ).rejects.toThrow()
    })
  })
})
