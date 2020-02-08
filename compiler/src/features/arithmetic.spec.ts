import test, { ExecutionContext } from "ava"
import { lex } from "./arithmetic"

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
