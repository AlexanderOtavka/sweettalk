import test from "ava"
import { lex, numberToken, parse, numberAst } from "./number"

test("can lex an integer", t => {
  t.deepEqual(lex("3"), {
    consumed: 1,
    newToken: numberToken(3),
  })
  t.deepEqual(lex("23"), {
    consumed: 2,
    newToken: numberToken(23),
  })
  t.deepEqual(lex("123"), {
    consumed: 3,
    newToken: numberToken(123),
  })
})

test("can lex a float", t => {
  t.deepEqual(lex("123.45"), {
    consumed: 6,
    newToken: numberToken(123.45),
  })
  t.deepEqual(lex("123.0"), {
    consumed: 5,
    newToken: numberToken(123),
  })
})

test("can lex an integer with commas", t => {
  t.deepEqual(lex("123,678"), {
    consumed: 7,
    newToken: numberToken(123678),
  })
})

test("can lex a float with commas", t => {
  t.deepEqual(lex("123,678.123,456"), {
    consumed: 15,
    newToken: numberToken(123678.123456),
  })
})

test("won't lex leading dots", t => {
  t.deepEqual(lex(".123"), { consumed: 0 })
})

test("lex ignores trailing dots", t => {
  t.deepEqual(lex("123."), {
    consumed: 3,
    newToken: numberToken(123),
  })
})

test("won't lex leading commas", t => {
  t.deepEqual(lex(",123"), { consumed: 0 })
  t.deepEqual(lex(",123.456"), { consumed: 0 })
})

test("lex ignores trailing commas", t => {
  t.deepEqual(lex("1,"), {
    consumed: 1,
    newToken: numberToken(1),
  })
  t.deepEqual(lex("12,"), {
    consumed: 2,
    newToken: numberToken(12),
  })
  t.deepEqual(lex("123,"), {
    consumed: 3,
    newToken: numberToken(123),
  })
  t.deepEqual(lex("123.4,"), {
    consumed: 5,
    newToken: numberToken(123.4),
  })
  t.deepEqual(lex("123.45,"), {
    consumed: 6,
    newToken: numberToken(123.45),
  })
  t.deepEqual(lex("123.456,"), {
    consumed: 7,
    newToken: numberToken(123.456),
  })
})

test("lex ignores ,. in the middle", t => {
  t.deepEqual(lex("123,.456"), {
    consumed: 3,
    newToken: numberToken(123),
  })
})

test("lex ignores ., in the middle", t => {
  t.deepEqual(lex("123.,456"), {
    consumed: 3,
    newToken: numberToken(123),
  })
})

test("parses a number token", t => {
  t.deepEqual(parse([numberToken(4)]), { consumed: 1, ast: numberAst(4) })
})

test("doesn't parse empty token list", t => {
  t.deepEqual(parse([]), { consumed: 0 })
})

test("doesn't parse non number tokens", t => {
  t.deepEqual(parse([{ type: "foo token" }]), { consumed: 0 })
})
