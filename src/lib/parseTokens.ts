// parseTokens = translate tokens into unstructured syntax tree (UST)
// Unstructured syntax tree ignores all operator precedence or semantics and
// just groups expressions using parens, brackets, and indentation. Separators
// are also inserted here at line endings

import { ok, error, forOkResult } from "./result"

export const programUst = (statements: readonly any[]) => ({
  type: "program ust",
  statements,
})

/**
 * Parse an entire token list into a UST
 */
export const parseTokensWithParsers = (
  tokens: readonly any[],
  parsers: readonly any[],
) => {
  if (tokens.length === 0) {
    return ok([])
  } else {
    for (const parser of parsers) {
      const { consumed, ust } = parser(tokens)
      if (consumed > 0) {
        return forOkResult(
          parseTokensWithParsers(tokens.slice(consumed), parsers),
          ({ statements }) => ok([ust, ...statements]),
        )
      }
    }

    return error(`Cannot parse tokens: ${tokens}`)
  }
}
