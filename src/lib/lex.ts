// lex = translate source code into tokens

import { ok, error, forOkResult } from "./result"

export const symbolLexer = (symbol: string, typeName: string) => (
  subFile: string,
) => {
  if (
    subFile.substring(0, symbol.length) === symbol &&
    (subFile.length === symbol.length || subFile[symbol.length].match(/[\s\w]/))
  ) {
    return { consumed: symbol.length, newToken: { type: typeName } }
  } else {
    return { consumed: 0 }
  }
}

export const keywordLexer = (keyword: string) => (subFile: string) => {
  const match = subFile.match(/^\w+/)
  if (match && match[0] === keyword) {
    return { consumed: keyword.length, newToken: { type: keyword } }
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

  const { consumed, newToken } = lexWithLexers(file, lexers)
  if (consumed > 0) {
    return forOkResult(
      lexFileWithLexers(file.substring(consumed), lexers),
      tokens => ok([newToken, ...tokens]),
    )
  } else if (file.match(/^[ \t]/)) {
    return lexFileWithLexers(file.substring(1), lexers)
  } else {
    const nonWhitespaceMatch = file.match(/^\S+/)
    if (nonWhitespaceMatch) {
      return error(`Unknown symbol: ${nonWhitespaceMatch[0]}`)
    } else {
      return error("Unknown whitespace")
    }
  }
}
