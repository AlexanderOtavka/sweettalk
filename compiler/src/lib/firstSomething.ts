import { nothing, Maybe, isSomething } from "./maybe"

const firstSomething = <T, R>(
  list: readonly T[],
  transform: (element: T, index: number, list: readonly T[]) => Maybe<R>,
) => {
  for (let i = 0; i < list.length; i++) {
    const result = transform(list[i], i, list)
    if (isSomething(result)) {
      return result
    }
  }

  return nothing
}

export default firstSomething
