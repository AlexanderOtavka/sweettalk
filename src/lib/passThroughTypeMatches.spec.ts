import test from "ava"
import passThroughTypeMatches from "./passThroughTypeMatches"

test("consumes matches without changing them", t => {
  t.deepEqual(passThroughTypeMatches([{ type: "foo" }], ["foo", "bar"]), {
    consumed: 1,
    ast: { type: "foo" },
  })
})

test("consumes matches from anywhere in the list of types", t => {
  t.deepEqual(passThroughTypeMatches([{ type: "foo" }], ["bar", "foo"]), {
    consumed: 1,
    ast: { type: "foo" },
  })
})

test("ignores the rest of the tokens", t => {
  t.deepEqual(
    passThroughTypeMatches([{ type: "foo" }, { type: "bar" }], ["foo"]),
    { consumed: 1, ast: { type: "foo" } },
  )
})

test("doesn't consume non-matching tokens", t => {
  t.deepEqual(
    passThroughTypeMatches([{ type: "foo" }, { type: "bar" }], ["zing"]),
    { consumed: 0, errors: [] },
  )
})

test("only consumes from the head of the list", t => {
  t.deepEqual(
    passThroughTypeMatches([{ type: "foo" }, { type: "bar" }], ["bar"]),
    { consumed: 0, errors: [] },
  )
})
