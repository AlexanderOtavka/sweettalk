import test from "ava"
import { parseProgram } from "./parse"
import { ok } from "./result"

test.todo("parseTokensWithParsers parses a single expression")
test.todo("parseTokensWithParsers parses a series of expressions")
test.todo("parseTokensWithParsers freaks out when nothing can parse a thing")

test("parseProgram can parse a single token", t => {
  t.deepEqual(
    parseProgram(
      [{ type: "a single value" }],
      { parseValue: [([ast], _parsers: any) => ({ consumed: 1, ast })] },
      ["parseValue"],
    ),
    ok({ type: "a single value" }),
  )
})
