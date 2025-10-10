import { ServiceProvider as DocumentServiceProvider } from '@/Document/Infrastructure/Container/ServiceProvider'
import { ServiceProviderInterface } from '@/Shared/Application/ServiceProviderInterface'
import { ServiceProvider as SharedServiceProvider } from '@/Shared/Infrastructure/Container/ServiceProvider'
import { ServiceProvider as UserServiceProvider } from '@/User/Infrastructure/Container/ServiceProvider'

export class ServiceProviderRegistry {
  private readonly serviceProviders: ServiceProviderInterface[]

  constructor() {
    this.serviceProviders = [
      new SharedServiceProvider(),
      new UserServiceProvider(),
      new DocumentServiceProvider(),
    ]
  }

  public getServiceProviders(): ServiceProviderInterface[] {
    return this.serviceProviders
  }
}
