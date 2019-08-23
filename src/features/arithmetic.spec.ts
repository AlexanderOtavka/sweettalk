import test, { ExecutionContext } from "ava"
import { lex, parseTerm } from "./arithmetic"

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

test("can parse 1 + 1", t => {
  const groupParsers = {
    parseValue: ([token]) => ({ consumed: 1, ast: token }),
    parseTerm: (tokens: readonly any[]) => parseTerm(tokens, groupParsers),
  }
  t.deepEqual(
    parseTerm(
      [{ type: "one" }, { type: "plus" }, { type: "one" }],
      groupParsers,
    ),
    {
      consumed: 3,
      ast: {
        type: "binary arithmetic operator",
        operator: "add",
        leftHandSide: { type: "one" },
        rightHandSide: { type: "one" },
      },
    },
  )
})

test("can parse 1 + 2 - 3", t => {
  const groupParsers = {
    parseValue: ([token]) => ({ consumed: 1, ast: token }),
    parseTerm: (tokens: readonly any[]) => parseTerm(tokens, groupParsers),
  }
  t.deepEqual(
    parseTerm(
      [
        { type: "one" },
        { type: "plus" },
        { type: "two" },
        { type: "minus" },
        { type: "three" },
      ],
      groupParsers,
    ),
    {
      consumed: 5,
      ast: {
        type: "binary arithmetic operator",
        operator: "subtract",

        leftHandSide: {
          type: "binary arithmetic operator",
          operator: "add",
          leftHandSide: { type: "one" },
          rightHandSide: { type: "two" },
        },
        rightHandSide: { type: "three" },
      },
    },
  )
})
