export interface Ok<V> {
  readonly type: "result ok"
  readonly value: V
}
export interface Error<E> {
  readonly type: "result error"
  readonly message: E
}

export type Result<V, E> = Ok<V> | Error<E>

export const ok = <T>(value: T): Ok<T> => ({
  type: "result ok",
  value,
})
export const error = <T>(message: T): Error<T> => ({
  type: "result error",
  message,
})

export const isOk = <V, E>(result: Result<V, E>): result is Ok<V> =>
  result.type === "result ok"

export const forOkResult = <V = any, E = any, R = any>(
  result: Result<V, E>,
  transform: (value: V) => Result<R, E>,
) => {
  if (result.type === "result ok") {
    return transform(result.value)
  } else {
    return result
  }
}

export const assertOk = <V = any>(result: Result<V, any>) => {
  if (result.type === "result ok") {
    return result.value
  } else if (result.type === "result error") {
    throw Error(JSON.stringify(result.message))
  } else {
    throw Error("Not a result")
  }
}
