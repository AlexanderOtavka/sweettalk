import { lexWithLexers, symbolLexer } from "../lib/lex"

const lexers = [
  symbolLexer("+", "plus"),
  symbolLexer("-", "minus"),
  symbolLexer("*", "star"),
  symbolLexer("/", "divide"),
  symbolLexer("%", "modulo"),
]

export const lex = (subFile: string) => lexWithLexers(subFile, lexers)
