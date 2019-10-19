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
  const token = tokens[index]
  return expectConsumption(
    tokens,
    index,
    token && token.type === type
      ? { consumed: 1, token }
      : { consumed: 0, errors: [] },
    type,
  )
}

export const expectConsumption = (
  tokens: readonly any[],
  index: number,
  result: any,
  type: string = "",
) => {
  const expectAnyResult = expectAnyToken(tokens, index, type)
  if (expectAnyResult.consumed === 0) {
    return expectAnyResult
  }

  if (result.consumed === 0 && result.errors.length === 0) {
    const token = tokens[index]
    return {
      consumed: 0,
      errors: [
        locatedError(
          type
            ? `Expected ${type}, but got '${token.type}'`
            : `Unexpected ${token.type}`,
          token.location,
        ),
      ],
    }
  }

  return result
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

const createParsers = (
  groupMapObject: any,
  precedence: readonly string[],
  mixinParsers: any = {},
) => {
  const parsers = {
    ...mixinParsers,
    ...precedence
      .map(name => [name, groupMapObject[name] || []])
      .reduce(
        (groups, [name, parserList], i) => {
          // Add parser at the end of the parser list to allow descent into higher
          // precedence terms
          const parsersWithDescent =
            i < precedence.length - 1
              ? [
                  ...parserList,
                  Object.assign(
                    (tokens: readonly any[], groupParsers: any) =>
                      groupParsers[precedence[i + 1]](tokens),
                    { debugName: `higherThan(${name})` },
                  ),
                ]
              : parserList
          groups[name] = (tokens: readonly any[]) =>
            parseWithParsers(tokens, parsersWithDescent, parsers)
          return groups
        },
        {} as any,
      ),
  }
  return parsers
}

export const parseProgramWithFeatures = (
  tokens: readonly any[],
  groupMapObject: any,
  programPrecedence: readonly string[],
  expressionPrecedence: readonly string[],
) => {
  const expressionParsers = createParsers(groupMapObject, expressionPrecedence)
  const programParsers = createParsers(
    groupMapObject,
    programPrecedence,
    expressionParsers,
  )

  const parseProgramStatement = programParsers[programPrecedence[0]]
  const { consumed, ast, errors } = parseProgramStatement(tokens)
  if (consumed === 0 && errors.length > 0) {
    return error(errors)
  } else {
    if (consumed < tokens.length) {
      return error(
        locatedError(
          `Parser didn't consume everything.  Stopped at ${tokens[consumed].type}`,
          tokens[consumed].location,
        ),
      )
    } else {
      return ok(ast)
    }
  }
}
