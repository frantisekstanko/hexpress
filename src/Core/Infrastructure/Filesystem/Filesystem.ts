import { constants } from 'node:fs'
import fs from 'node:fs/promises'
import { injectable } from 'inversify'
import { FilesystemInterface } from '@/Core/Infrastructure/Filesystem/FilesystemInterface'

@injectable()
export class Filesystem implements FilesystemInterface {
  public async fileExists(path: string): Promise<boolean> {
    try {
      await fs.access(path, constants.F_OK)
      return true
    } catch {
      return false
    }
  }

  public async readFile(path: string): Promise<string> {
    return await fs.readFile(path, 'utf8')
  }
}
