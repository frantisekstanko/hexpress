export type ServiceToken<T> = symbol & { readonly __type?: T }

export function createTypedSymbol<T>(name: string): ServiceToken<T> {
  return Symbol.for(name) as ServiceToken<T>
}
