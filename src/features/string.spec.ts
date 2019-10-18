import test from "ava"
import { lex } from "./string"

test("it can lex a basic string", t => {
  t.deepEqual(lex('"foo"'), {
    consumed: 5,
    newToken: { type: "literal", kind: "string", value: "foo" },
  })
})

test("a string can escape a quote", t => {
  t.deepEqual(lex('"foo\\" bar"'), {
    consumed: 11,
    newToken: { type: "literal", kind: "string", value: 'foo" bar' },
  })
})

test("a string can escape an n for a newline", t => {
  t.deepEqual(lex('"foo\\n bar"'), {
    consumed: 11,
    newToken: { type: "literal", kind: "string", value: "foo\n bar" },
  })
})
