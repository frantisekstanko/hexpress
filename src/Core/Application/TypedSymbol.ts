export type TypedSymbol<T> = symbol & { readonly __type?: T }

export function createTypedSymbol<T>(name: string): TypedSymbol<T> {
  return Symbol.for(name) as TypedSymbol<T>
}
