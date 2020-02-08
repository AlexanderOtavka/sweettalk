import test from "ava"
import match, { MANY, ANY, isAMatch } from "./match"

test("matches strings", t => {
  t.true(isAMatch("foo", "foo"))
})

test("doesn't match different strings", t => {
  t.false(isAMatch("foo", "foo "))
})

test("matches numbers", t => {
  t.true(isAMatch(5, 5))
})

test("doesn't match different numbers", t => {
  t.false(isAMatch(4, 5))
})

test("matches symbols", t => {
  const a = Symbol("a")
  t.true(isAMatch(a, a))
})

test("doesn't match different symbols", t => {
  t.false(isAMatch(Symbol("a"), Symbol("a")))
})

test("matches any", t => {
  t.true(isAMatch("foo", ANY))
  t.true(isAMatch(8, ANY))
  t.true(isAMatch(Symbol("x"), ANY))
  t.true(isAMatch({ f: 9 }, ANY))
  t.true(isAMatch([1, 1, 1], ANY))
  t.true(isAMatch([{ foo: 4 }, "bar", Symbol("3")], ANY))
})

test("matches objects", t => {
  t.true(isAMatch({ foo: 1 }, { foo: 1 }))
})

test("matches objects that have more properties than the pattern", t => {
  t.true(isAMatch({ foo: 1, bar: 2 }, { foo: 1 }))
})

test("doesn't match different objects", t => {
  t.false(isAMatch({ foo: 2 }, { foo: 1 }))
  t.false(isAMatch({ bar: 1 }, { foo: 1 }))
})

test("matches exactly equal arrays", t => {
  t.true(isAMatch(["foo", "bar", "baz"], ["foo", "bar", "baz"]))
})

test("matches arrays with many elements", t => {
  t.true(isAMatch([], MANY(1)))
  t.true(isAMatch([1, 1, 1], MANY(1)))
  t.true(isAMatch([1, 2, 3], MANY(ANY)))
})

test("matches leading elements of arrays", t => {
  t.true(isAMatch([1, 2, 3], [1, 2, ...MANY(ANY)]))
})

test("matches array with multiple manys chained", t => {
  t.true(isAMatch([1, 1, 1, 3, 3, 3], [...MANY(1), ...MANY(3)]))
  t.true(isAMatch([1, 1, 1], [...MANY(1), ...MANY(3)]))
})

test("matches empty arrays", t => {
  t.true(isAMatch([], []))
})

test("doesn't match different arrays", t => {
  t.false(isAMatch([1, 2, 3], [1, 2]))
  t.false(isAMatch([1, 2, 3], MANY(1)))
  t.false(isAMatch([1, 2, 3], [2]))
  t.false(isAMatch([1], []))
  t.false(isAMatch([undefined], []))
  t.false(isAMatch([1, 2, 1, 3, 3, 3], [...MANY(1), ...MANY(3)]))
  t.false(isAMatch([1, 1, 1, 2, 3, 3, 3], [...MANY(1), ...MANY(3)]))
  t.false(isAMatch([1, 1, 1, 2], [...MANY(1), ...MANY(3)]))
})

test("throws if ANY is passed as a value, not a pattern", t => {
  t.throws(() => isAMatch(ANY, ANY))
})

test("matches recursively", t => {
  const symbol = Symbol("foo")
  t.true(
    isAMatch(
      {
        arr: [1, 2, 3, "four"],
        symbol,
        objects: [{ foo: 1, bar: 2 }, { foo: 3 }, { foo: 7 }],
        num: 1,
      },
      { arr: MANY(ANY), symbol, objects: MANY({ foo: ANY }) },
    ),
  )
})

test("matches on a list", t => {
  t.deepEqual(
    match("foo", [
      ["bar", x => x + " zip"],
      ["foo", x => x + " zap"],
      ["foo", x => x + " zop"],
      [ANY, _ => "23"],
    ]),
    "foo zap",
  )
})

test("errors if we reach the end", t => {
  t.throws(() => match("foo", [[1, _ => 3], [2, _ => 4]]))
})
