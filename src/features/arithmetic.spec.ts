import test, { ExecutionContext } from "ava"
import { lex, parseTokens } from "./arithmetic"

const canLex = (t: ExecutionContext, symbol: string, type: string) => {
  t.deepEqual(lex(`${symbol} foo`), { consumed: 1, newToken: { type } })
}
// tslint:disable-next-line:no-expression-statement
canLex.title = (_: any, symbol: string) => `can lex a ${symbol}`

test(canLex, "+", "plus")
test(canLex, "-", "minus")
test(canLex, "*", "star")
test(canLex, "/", "divide")
test(canLex, "%", "modulo")

const canParseToken = (t: ExecutionContext, type: string) => {
  t.deepEqual(parseTokens([{ type }]), { consumed: 1, ust: { type } })
}
// tslint:disable-next-line:no-expression-statement
canParseToken.title = (_: any, type: string) => `can parse ${type} token`

test(canParseToken, "plus")
test(canParseToken, "minus")
test(canParseToken, "star")
test(canParseToken, "divide")
test(canParseToken, "modulo")
