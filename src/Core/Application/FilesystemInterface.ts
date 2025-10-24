export interface FilesystemInterface {
  fileExists(path: string): Promise<boolean>
  readFile(path: string): Promise<string>
}
