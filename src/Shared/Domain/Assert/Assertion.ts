import { Assertion as VendorAssertion } from '@frantisekstanko/assertion'
import { AssertionFailedException } from '@/Shared/Domain/Assert/AssertionFailedException'

export class Assertion extends VendorAssertion {
  protected static createException(message: string): Error {
    return new AssertionFailedException(message)
  }
}
