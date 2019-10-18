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

export const isOk = <V, E>(result: Result<V, E>): result is Ok<V> => {
  const { type } = result
  if (type !== "result ok" && type !== "result error") {
    throw Error("Not a result")
  }
  return type === "result ok"
}

export const forOkResult = <V = any, E = any, R = any>(
  result: Result<V, E>,
  transform: (value: V) => Result<R, E>,
) => {
  if (isOk(result)) {
    return transform(result.value)
  } else {
    return result
  }
}

export const allOkResults = <V, E>(results: ReadonlyArray<Result<V, E>>) => {
  const values = []
  for (const result of results) {
    if (isOk(result)) {
      values.push(result.value)
    } else {
      return result
    }
  }

  return ok(values)
}

export const assertOk = <V = any>(result: Result<V, any>) => {
  if (isOk(result)) {
    return result.value
  } else {
    throw Error(JSON.stringify(result.message))
  }
}
