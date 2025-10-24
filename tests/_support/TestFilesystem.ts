import { FilesystemInterface } from '@/Core/Application/FilesystemInterface'

export class TestFilesystem implements FilesystemInterface {
  private files = new Map<string, string>()

  public setFile(path: string, content: string): void {
    this.files.set(path, content)
  }

  public fileExists(path: string): Promise<boolean> {
    return Promise.resolve(this.files.has(path))
  }

  public readFile(path: string): Promise<string> {
    const content = this.files.get(path)
    if (content === undefined) {
      return Promise.reject(new Error(`File not found: ${path}`))
    }
    return Promise.resolve(content)
  }

  public clear(): void {
    this.files.clear()
  }
}
