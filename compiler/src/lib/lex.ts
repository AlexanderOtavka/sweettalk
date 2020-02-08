// lex = translate source code into tokens

import { ok, error } from "./result"
import { rangeLocation, singleLocation } from "./location"
import { locatedError } from "./error"

export const symbolLexer = (symbol: string, typeName: string) => (
  subFile: string,
) => {
  if (
    subFile.substring(0, symbol.length) === symbol &&
    (subFile.length === symbol.length ||
      subFile[symbol.length].match(/[\s\w]/) ||
      "(){}[]".split("").includes(symbol))
  ) {
    return { consumed: symbol.length, newToken: { type: typeName } }
  } else {
    return { consumed: 0 }
  }
}

export const lexWithLexers = (subFile: string, lexers: readonly any[]) => {
  for (const lex of lexers) {
    const result = lex(subFile)
    if (result.consumed > 0) {
      return result
    }
  }

  return { consumed: 0 }
}

export const lexFileWithLexers = (file: string, lexers: readonly any[]) => {
  if (file === "") {
    return ok([])
  }

  const tokens = []

  let i = 0
  while (i < file.length) {
    const { consumed, newToken } = lexWithLexers(file.substring(i), lexers)
    if (consumed > 0) {
      tokens.push({
        ...newToken,
        location: rangeLocation(i, i + consumed),
      })
      i += consumed
    } else if (file[i] === " " || file[i] === "\t") {
      i++
    } else {
      const nonWhitespaceMatch = file.substring(i).match(/^\S+/)
      if (nonWhitespaceMatch) {
        return error(
          locatedError(
            `Unknown symbol: ${nonWhitespaceMatch[0]}`,
            rangeLocation(i, i + nonWhitespaceMatch[0].length),
          ),
        )
      } else {
        return error(locatedError("Unknown whitespace", singleLocation(i)))
      }
    }
  }

  return ok(tokens)
}
