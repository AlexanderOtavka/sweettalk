import match, { ANY } from "../lib/match"

export const numberToken = (value: number) => ({ type: "number token", value })

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

export const numberUst = (value: number) => ({
  type: "number ust",
  value,
})

export const parseTokens = (tokens: readonly any[]) =>
  match(tokens, [
    [
      [numberToken(ANY)],
      ([{ value }]) => ({ consumed: 1, ust: numberUst(value) }),
    ],
    [ANY, _ => ({ consumed: 0 })],
  ])
