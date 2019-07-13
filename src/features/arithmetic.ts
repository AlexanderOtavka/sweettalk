import { lexWithLexers, symbolLexer } from "../lib/lex"
import passThroughTypeMatches from "../lib/passThroughTypeMatches"

const lexers = [
  symbolLexer("+", "plus"),
  symbolLexer("-", "minus"),
  symbolLexer("*", "star"),
  symbolLexer("/", "divide"),
  symbolLexer("%", "modulo"),
]

export const lex = (subFile: string) => lexWithLexers(subFile, lexers)

export const parseTokens = (tokens: readonly any[]) =>
  passThroughTypeMatches(tokens, ["plus", "minus", "star", "divide", "modulo"])
