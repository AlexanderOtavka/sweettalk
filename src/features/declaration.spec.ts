import test from "ava"
import { lex } from "./declaration"

test("can lex declarator", t => {
  t.deepEqual(lex("= bar"), {
    consumed: 1,
    newToken: { type: "declarator" },
  })
})

test("can lex statement ending", t => {
  t.deepEqual(lex("; baz"), {
    consumed: 1,
    newToken: { type: "statement ending" },
  })
})
