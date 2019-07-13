import passThroughTypeMatches from "../lib/passThroughTypeMatches"

export const numberToken = (value: number) => ({ type: "number", value })

export const lex = (subFile: string) => {
  const match = subFile.match(/^\d([\d,]*\d)?(\.\d([\d,]*\d)?)?/)
  if (match) {
    return {
      consumed: match[0].length,
      newToken: numberToken(+match[0].replace(/,/g, "")),
    }
  } else {
    return { consumed: 0 }
  }
}

export const numberUst = numberToken

export const parseTokens = (tokens: readonly any[]) =>
  passThroughTypeMatches(tokens, ["number"])
