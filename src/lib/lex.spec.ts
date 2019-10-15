import test from "ava"
import {
  symbolLexer,
  keywordLexer,
  lexWithLexers,
  lexFileWithLexers,
} from "./lex"
import { ok, error } from "./result"
import { locatedError } from "./error"
import { singleLocation, rangeLocation } from "./location"

const ltLexer = symbolLexer("<", "lessThan")

test("symbolLexer consumes matching symbols", t => {
  t.deepEqual(ltLexer("< 5"), { consumed: 1, newToken: { type: "lessThan" } })
})

test("symbolLexer splits on words and numbers", t => {
  t.deepEqual(ltLexer("<5"), { consumed: 1, newToken: { type: "lessThan" } })
  t.deepEqual(ltLexer("<if"), { consumed: 1, newToken: { type: "lessThan" } })
  t.deepEqual(ltLexer("<_foo"), { consumed: 1, newToken: { type: "lessThan" } })
})

test("symbolLexer ignores symbol substrings", t => {
  t.deepEqual(ltLexer("<= 5"), { consumed: 0 })
})

test("symbolLexer handles symbols at the end of the file", t => {
  t.deepEqual(ltLexer("<"), { consumed: 1, newToken: { type: "lessThan" } })
})

test("symbolLexer ignores symbols further in the file", t => {
  t.deepEqual(ltLexer("5 < 7"), { consumed: 0 })
})

const ifLexer = keywordLexer("if")

test("keywordLexer consumes matching words", t => {
  t.deepEqual(ifLexer("if true"), {
    consumed: 2,
    newToken: { type: "if" },
  })
})

test("keywordLexer splits on symbols", t => {
  t.deepEqual(ifLexer("if-5 then"), {
    consumed: 2,
    newToken: { type: "if" },
  })
  t.deepEqual(ifLexer("if) + 5 then"), {
    consumed: 2,
    newToken: { type: "if" },
  })
})

test("keywordLexer ignores word substrings", t => {
  t.deepEqual(ifLexer("if_ 5"), { consumed: 0 })
  t.deepEqual(ifLexer("iff 5"), { consumed: 0 })
  t.deepEqual(ifLexer("if5 then"), { consumed: 0 })
})

test("keywordLexer handles words at the end of the file", t => {
  t.deepEqual(ifLexer("if"), { consumed: 2, newToken: { type: "if" } })
})

test("keywordLexer ignores words further in the file", t => {
  t.deepEqual(ifLexer("5 + if 7"), { consumed: 0 })
})

const fooLexer = (subFile: string) => {
  if (subFile.match(/^foo/)) {
    return { consumed: 3, newToken: { type: "foo" } }
  } else {
    return { consumed: 0 }
  }
}

const foodLexer = (subFile: string) => {
  if (subFile.match(/^food/)) {
    return { consumed: 4, newToken: { type: "food" } }
  } else {
    return { consumed: 0 }
  }
}

test("lexWithLexers picks the first lexer", t => {
  t.deepEqual(lexWithLexers("food is yummy", [fooLexer, foodLexer]), {
    consumed: 3,
    newToken: { type: "foo" },
  })
  t.deepEqual(lexWithLexers("food is yummy", [foodLexer, fooLexer]), {
    consumed: 4,
    newToken: { type: "food" },
  })
})

test("lexWithLexers consumes nothing if no lexers matched", t => {
  t.deepEqual(lexWithLexers("the apple is yummy", [fooLexer, foodLexer]), {
    consumed: 0,
  })
})

test("lexFileWithLexers lexes a file when the tokens are known", t => {
  t.deepEqual(
    lexFileWithLexers("foo food < if foo", [
      foodLexer,
      fooLexer,
      ifLexer,
      ltLexer,
    ]),
    ok([
      { type: "foo", location: rangeLocation(0, 3) },
      { type: "food", location: rangeLocation(4, 8) },
      { type: "lessThan", location: rangeLocation(9, 10) },
      { type: "if", location: rangeLocation(11, 13) },
      { type: "foo", location: rangeLocation(14, 17) },
    ]),
  )
})

test("lexFileWithLexers freaks out when it doesn't know a symbol", t => {
  t.deepEqual(
    lexFileWithLexers("foo food < if foo", [foodLexer, fooLexer, ltLexer]),
    error(locatedError("Unknown symbol: if", rangeLocation(11, 13))),
  )
})

test("lexFileWithLexers freaks out when it hits unexpected whitespace", t => {
  t.deepEqual(
    lexFileWithLexers("foo food \f foo", [foodLexer, fooLexer]),
    error(locatedError("Unknown whitespace", singleLocation(9))),
  )
  t.deepEqual(
    lexFileWithLexers("foo food \r foo", [foodLexer, fooLexer]),
    error(locatedError("Unknown whitespace", singleLocation(9))),
  )
  t.deepEqual(
    lexFileWithLexers("foo food \r\r\n foo", [foodLexer, fooLexer]),
    error(locatedError("Unknown whitespace", singleLocation(9))),
  )
})
