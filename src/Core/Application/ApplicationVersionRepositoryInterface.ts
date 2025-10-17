export interface ApplicationVersionRepositoryInterface {
  getCurrentVersion(): Promise<string>
}
