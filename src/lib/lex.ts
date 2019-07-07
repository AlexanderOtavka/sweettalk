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

export const lexIndent = (subFile: string) => {
  const matchFromSpacesOrTabs = (str: string) => {
    if (str[0] === " ") {
      const { consumed, value } = matchFromSpacesOrTabs(str.substring(1))
      return { consumed: consumed + 1, value: " " + value }
    } else if (str[0] === "\t") {
      const { consumed, value } = matchFromSpacesOrTabs(str.substring(1))
      return { consumed: consumed + 1, value: "\t" + value }
    } else {
      return { consumed: 0, value: "" }
    }
  }

  const matchFromLf = (str: string) => {
    if (str[0] === "\n") {
      const { consumed, value } = matchFromSpacesOrTabs(str.substring(1))
      return { consumed: consumed + 1, value }
    } else {
      return { consumed: 0, value: "" }
    }
  }

  const matchFromCrMaybe = (str: string) => {
    if (str[0] === "\r") {
      const { consumed, value } = matchFromLf(str.substring(1))
      if (consumed > 0) {
        return { consumed: consumed + 1, value }
      } else {
        return { consumed: 0, value: "" }
      }
    } else {
      return matchFromLf(str)
    }
  }

  const { consumed, value } = matchFromCrMaybe(subFile)
  if (consumed > 0) {
    return { consumed, newToken: { type: "indent", value } }
  } else {
    return { consumed: 0 }
  }
}

export const lexFileWithLexers = (file: string, lexers: readonly any[]) => {
  if (file === "") {
    return ok([])
  }

  const { consumed, newToken } = lexWithLexers(file, [lexIndent, ...lexers])
  if (consumed > 0) {
    return forOkResult(
      lexFileWithLexers(file.substring(consumed), lexers),
      tokens =>
        tokens.length > 0 &&
        tokens[0].type === "indent" &&
        newToken.type === "indent"
          ? tokens
          : [newToken, ...tokens],
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
