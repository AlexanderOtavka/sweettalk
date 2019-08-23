import passThroughTypeMatches from "../lib/passThroughTypeMatches"
import match, { ANY } from "../lib/match"
import { something, nothing } from "../lib/maybe"

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

export const numberAst = numberToken

export const parseValue = (tokens: readonly any[]) =>
  passThroughTypeMatches(tokens, ["number"])

export const compileToJs = (ast: any, _compile: (ast: any) => any) =>
  match(ast, [
    [numberAst(ANY), ({ value }) => something({ type: "Literal", value })],
    [ANY, _ => nothing],
  ])
