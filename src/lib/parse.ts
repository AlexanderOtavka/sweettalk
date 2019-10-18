import { ok, error } from "./result"
import { locatedError } from "./error"
import { rangeLocationFromLocations } from "./location"

export const expectAnyToken = (
  tokens: readonly any[],
  index: number,
  type: string = "",
) => {
  if (tokens.length <= index) {
    return {
      consumed: 0,
      errors: [
        locatedError(
          type ? `Expected ${type}, but got eof instead!` : "Unexpected eof!",
          rangeLocationFromLocations(
            tokens[0].location,
            tokens[index - 1].location,
          ),
        ),
      ],
    }
  }

  return { consumed: 1, token: tokens[index] }
}

export const expectToken = (
  tokens: readonly any[],
  index: number,
  type: string,
) => {
  const expectAnyResult = expectAnyToken(tokens, index, type)
  if (expectAnyResult.consumed === 0) {
    return expectAnyResult
  }

  const token = tokens[index]

  if (token.type !== type) {
    return {
      consumed: 0,
      errors: [
        locatedError(
          `Expected ${type}, but got '${token.type}'`,
          token.location,
        ),
      ],
    }
  }

  return { consumed: 1, token }
}

/**
 * Parse a list of tokens into an AST.
 */
const parseWithParsers = (
  tokens: readonly any[],
  parsers: readonly any[],
  groupParsers: any,
) => {
  for (const parse of parsers) {
    const result = parse(tokens, groupParsers)
    if (result.consumed > 0) {
      return result
    } else if (result.errors.length > 0) {
      return { consumed: 0, errors: result.errors }
    }
  }

  return { consumed: 0, errors: [] }
}

export const injectParserDependency = (
  parserGroups: any,
  parserName: string,
  dependency: any,
) => ({
  ...parserGroups,
  [parserName]: parserGroups[parserName].map((parse: any) =>
    Object.assign((...args: any[]) => parse(...args, dependency), {
      debugName: parserName,
    }),
  ),
})

export const parseProgram = (
  tokens: readonly any[],
  groupMapObject: any,
  precedence: readonly string[],
) => {
  const groupParsers = precedence
    .map(name => [name, groupMapObject[name] || []])
    .reduce(
      (groups, [name, parsers], i) => {
        // Add parser at the end of the parser list to allow descent into higher
        // precedence terms
        const parsersWithDescent =
          i < precedence.length - 1
            ? [
                ...parsers,
                Object.assign(
                  (tokens: readonly any[], groupParsers: any) =>
                    groupParsers[precedence[i + 1]](tokens),
                  { debugName: `higherThan(${name})` },
                ),
              ]
            : parsers
        groups[name] = (tokens: readonly any[]) =>
          parseWithParsers(tokens, parsersWithDescent, groupParsers)
        return groups
      },
      {} as any,
    )

  if (tokens.length === 0) {
    return error("Cannot parse empty token list")
  } else {
    const { consumed, ast, errors } = groupParsers[precedence[0]](tokens)
    if (consumed === 0) {
      return error(errors)
    } else {
      if (consumed < tokens.length) {
        return error("Parser didn't consume everything")
      } else {
        return ok(ast)
      }
    }
  }
}
