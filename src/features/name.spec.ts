import test from "ava"
import { lex, compileToJs } from "./name"
import { something } from "../lib/maybe"
import { error } from "../lib/result"
import { locatedError } from "../lib/error"
import { rangeLocation } from "../lib/location"

test("can lex a name", t => {
  t.deepEqual(lex("Foo ="), {
    consumed: 3,
    newToken: { type: "name", name: "Foo" },
  })
  t.deepEqual(lex("Bar_Baz ="), {
    consumed: 7,
    newToken: { type: "name", name: "Bar_Baz" },
  })
  t.deepEqual(lex("Z ="), {
    consumed: 1,
    newToken: { type: "name", name: "Z" },
  })
  t.deepEqual(lex("To_Be_Honest ="), {
    consumed: 12,
    newToken: { type: "name", name: "To_Be_Honest" },
  })
  t.deepEqual(lex("T_B_H ="), {
    consumed: 5,
    newToken: { type: "name", name: "T_B_H" },
  })
})

test("won't lex invalid names", t => {
  t.deepEqual(lex("foo ="), { consumed: 0 })
  t.deepEqual(lex("Bar_baz ="), { consumed: 0 })
  t.deepEqual(lex("ZZ ="), { consumed: 0 })
  t.deepEqual(lex("ToBeHonest ="), { consumed: 0 })
  t.deepEqual(lex("T_b_h ="), { consumed: 0 })
})

test("errors when a name isn't in the environment", t => {
  t.deepEqual(
    compileToJs(
      { type: "name", name: "Foo", location: rangeLocation(0, 4) },
      {},
      [],
      x => x,
    ),
    something(
      error(locatedError("No variable named 'Foo'", rangeLocation(0, 4))),
    ),
  )
})
