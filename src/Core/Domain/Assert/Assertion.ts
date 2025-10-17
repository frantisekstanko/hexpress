import { Assertion as VendorAssertion } from '@frantisekstanko/assertion'
import { AssertionFailedException } from '@/Core/Domain/Assert/AssertionFailedException'

export class Assertion extends VendorAssertion {
  protected static createException(message: string): Error {
    return new AssertionFailedException(message)
  }
}
