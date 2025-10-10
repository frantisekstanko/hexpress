import { TestContainerFactory } from '@Tests/_support/TestContainerFactory'
import { TestDatabase } from '@Tests/_support/TestDatabase'
import { ConfigInterface } from '@/Shared/Application/Config/ConfigInterface'
import { Symbols } from '@/Shared/Application/Symbols'

export default async function globalTeardown(): Promise<void> {
  const container = TestContainerFactory.create()
  const config = container.get<ConfigInterface>(Symbols.ConfigInterface)
  const testDatabase = new TestDatabase(config)
  await testDatabase.drop()
}
