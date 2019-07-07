import test from "ava"
import { lex } from "./arithmetic"

test("can lex a +", t => {
  t.deepEqual(lex("+ foo"), { consumed: 1, newToken: { type: "plus" } })
})

test("can lex a -", t => {
  t.deepEqual(lex("- foo"), { consumed: 1, newToken: { type: "minus" } })
})

test("can lex a *", t => {
  t.deepEqual(lex("* foo"), { consumed: 1, newToken: { type: "star" } })
})

test("can lex a /", t => {
  t.deepEqual(lex("/ foo"), { consumed: 1, newToken: { type: "divide" } })
})

test("can lex a %", t => {
  t.deepEqual(lex("% foo"), { consumed: 1, newToken: { type: "modulo" } })
})
