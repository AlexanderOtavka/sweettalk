import { ok, Result } from "./result"

export interface Something<V> {
  readonly type: "maybe something"
  readonly value: V
}
export interface Nothing {
  readonly type: "maybe nothing"
}
export type Maybe<V> = Something<V> | Nothing

export const something = <T>(value: T): Something<T> => ({
  type: "maybe something",
  value,
})
export const nothing: Nothing = {
  type: "maybe nothing",
}

export const isSomething = <V>(maybe: Maybe<V>): maybe is Something<V> =>
  maybe.type === "maybe something"

export const forSomethingMaybe = <V = any, R = any>(
  maybe: Maybe<V>,
  transform: (value: V) => Maybe<R>,
) => {
  if (maybe.type === "maybe something") {
    return transform(maybe.value)
  } else {
    return maybe
  }
}

export const maybeResult = <V = any, E = any>(
  maybe: Maybe<V>,
  getDefault: () => Result<V, E>,
) => {
  if (maybe.type === "maybe something") {
    return ok(maybe.value)
  } else {
    return getDefault()
  }
}

export const assertSomething = <V = any>(
  maybe: Maybe<V>,
  errorMessage = "expected something, got nothing",
) => {
  if (maybe.type === "maybe something") {
    return maybe.value
  } else {
    throw Error(errorMessage)
  }
}
