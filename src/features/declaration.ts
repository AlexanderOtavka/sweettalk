import { lexWithLexers, symbolLexer } from "../lib/lex"

const lexers = [
  symbolLexer("=", "declarator"),
  symbolLexer(";", "statement ending"),
]
export const lex = (subFile: string) => lexWithLexers(subFile, lexers)

// TODO: revamp parser plugins, and factor parsing out of a library call
