import { ServiceProviderInterface } from '@/Core/Application/ServiceProviderInterface'
import { CommandServiceProvider } from '@/Core/Infrastructure/Container/CommandServiceProvider'
import { DatabaseServiceProvider } from '@/Core/Infrastructure/Container/DatabaseServiceProvider'
import { EventServiceProvider } from '@/Core/Infrastructure/Container/EventServiceProvider'
import { HttpServiceProvider } from '@/Core/Infrastructure/Container/HttpServiceProvider'
import { ServiceProvider as CoreServiceProvider } from '@/Core/Infrastructure/Container/ServiceProvider'
import { WebSocketServiceProvider } from '@/Core/Infrastructure/Container/WebSocketServiceProvider'
import { ServiceProvider as DocumentServiceProvider } from '@/Document/Infrastructure/Container/ServiceProvider'
import { ServiceProvider as UserServiceProvider } from '@/User/Infrastructure/Container/ServiceProvider'

export class ServiceProviderRegistry {
  private readonly serviceProviders: ServiceProviderInterface[]

  constructor() {
    this.serviceProviders = [
      new CoreServiceProvider(),
      new DatabaseServiceProvider(),
      new CommandServiceProvider(),
      new EventServiceProvider(),
      new HttpServiceProvider(),
      new WebSocketServiceProvider(),
      new UserServiceProvider(),
      new DocumentServiceProvider(),
    ]
  }

  public getServiceProviders(): ServiceProviderInterface[] {
    return this.serviceProviders
  }
}
