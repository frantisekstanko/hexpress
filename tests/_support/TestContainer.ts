import { Container } from '@/Shared/Infrastructure/Container'

export class TestContainer {
  private constructor(private readonly container: Container) {}

  public static create(container: Container): TestContainer {
    return new TestContainer(container)
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  public get<T>(identifier: symbol): T {
    return this.container.get<T>(identifier)
  }

  public has(identifier: symbol): boolean {
    return this.container.has(identifier)
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  public replace<T>(symbol: symbol, instance: T): void {
    const inversifyContainer = (this.container as any).inversifyContainer
    if (inversifyContainer.isBound(symbol)) {
      inversifyContainer.unbind(symbol)
    }
    inversifyContainer.bind(symbol).toConstantValue(instance)
  }
}
