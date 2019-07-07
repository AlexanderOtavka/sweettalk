export type Result<V, E> =
  | { type: "result ok"; value: V }
  | { type: "result error"; message: E }

export const ok = <T>(value: T) => ({ type: "result ok", value })
export const error = <T>(message: T) => ({ type: "result error", message })

export const forOkResult = <V = any, E = any, R = any>(
  result: Result<V, E>,
  transform: (value: V) => R,
) => {
  if (result.type === "result ok") {
    return ok(transform(result.value))
  } else {
    return result
  }
}
