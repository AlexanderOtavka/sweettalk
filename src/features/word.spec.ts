import test from "ava"
import { lex } from "./word"

test("can lex a word", t => {
  t.deepEqual(lex("foo ="), {
    consumed: 3,
    newToken: { type: "word", word: "foo" },
  })
  t.deepEqual(lex("bar_baz ="), {
    consumed: 7,
    newToken: { type: "word", word: "bar_baz" },
  })
  t.deepEqual(lex("z ="), {
    consumed: 1,
    newToken: { type: "word", word: "z" },
  })
  t.deepEqual(lex("to_be_honest ="), {
    consumed: 12,
    newToken: { type: "word", word: "to_be_honest" },
  })
  t.deepEqual(lex("t_b_h ="), {
    consumed: 5,
    newToken: { type: "word", word: "t_b_h" },
  })
})

test("won't lex invalid words", t => {
  t.deepEqual(lex("Foo ="), { consumed: 0 })
  t.deepEqual(lex("bar_Baz ="), { consumed: 0 })
  t.deepEqual(lex("zZ ="), { consumed: 0 })
  t.deepEqual(lex("toBeHonest ="), { consumed: 0 })
  t.deepEqual(lex("t_b_3 ="), { consumed: 0 })
})
