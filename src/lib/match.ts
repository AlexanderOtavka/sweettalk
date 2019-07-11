export const ANY = Symbol("match any") as any
const MANY_SYMBOL = Symbol("match many")
export const MANY = (pattern: any) => [{ type: MANY_SYMBOL, pattern } as any]

export const isAMatch = (thing: any, pattern: any) => {
  if (thing === ANY) {
    throw Error("ANY should only be used in patterns, not in things")
  } else if (pattern === ANY) {
    return true
  } else if (typeof pattern === "object") {
    if (Array.isArray(pattern)) {
      if (Array.isArray(thing)) {
        if (pattern.length === 0) {
          return thing.length === 0
        } else {
          const [subPattern, ...otherSubPatterns] = pattern
          if (subPattern.type === MANY_SYMBOL) {
            if (thing.length === 0) {
              return true
            } else {
              const [firstThing, ...otherThings] = thing
              return (
                // subPattern.pattern === ANY ||
                isAMatch(firstThing, subPattern.pattern) &&
                (isAMatch(otherThings, pattern) ||
                  isAMatch(otherThings, otherSubPatterns))
              )
            }
          } else {
            if (thing.length === 0) {
              return false
            } else {
              const [firstThing, ...otherThings] = thing
              return (
                isAMatch(firstThing, subPattern) &&
                isAMatch(otherThings, otherSubPatterns)
              )
            }
          }
        }
      } else {
        return false
      }
    } else {
      return Object.keys(pattern).every(key =>
        isAMatch(thing[key], pattern[key]),
      )
    }
  } else if (typeof pattern === "function") {
    throw Error(
      `Cannot pattern match on a function (${pattern.name || "anonymous"})`,
    )
  } else {
    return pattern === thing
  }
}

const match = <T>(
  thing: T,
  matchers: ReadonlyArray<[any, (thing: T) => any]>,
) => {
  for (const [pattern, consequent] of matchers) {
    if (isAMatch(thing, pattern)) {
      return consequent(thing)
    }
  }

  throw Error(`Cannot find match for ${thing}`)
}

export default match
