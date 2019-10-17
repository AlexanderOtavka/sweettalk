import { ok, error } from "./result"

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
                (tokens: readonly any[], groupParsers: any) =>
                  groupParsers[precedence[i + 1]](tokens),
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
