export type Result<V, E> =
  | { readonly type: "result ok"; readonly value: V }
  | { readonly type: "result error"; readonly message: E }

export const ok = <T>(value: T): Result<T, never> => ({
  type: "result ok",
  value,
})
export const error = <T>(message: T): Result<never, T> => ({
  type: "result error",
  message,
})

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
  } else {
    throw Error(result.message.toString())
  }
}
