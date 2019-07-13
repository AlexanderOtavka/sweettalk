import test from "ava"
import { lex } from "./indentation"

test("lexes indents", t => {
  t.deepEqual(lex("\n  foo\n  foo"), {
    consumed: 3,
    newToken: { type: "indent", value: "  " },
  })
})

test("lexFileWithLexers handles windows line endings", t => {
  t.deepEqual(lex("\r\n  if"), {
    consumed: 4,
    newToken: { type: "indent", value: "  " },
  })
})
