import test, { ExecutionContext } from "ava"
import { lex, parsers } from "./declaration"
import { locatedError } from "../lib/error"
import { rangeLocation } from "../lib/location"
import { something } from "../lib/maybe"
import { error, ok } from "../lib/result"
import { leaksNames } from "../lib/leakyNames"

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

const groupParsers = {
  parseExpression: ([token]) =>
    token && token.type === "expression"
      ? { consumed: 1, ast: token }
      : { consumed: 0, errors: [] },
}

test("can parse a declaration", t => {
  t.deepEqual(
    parsers.parseDeclaration(
      [
        { type: "name", name: "Foo", location: rangeLocation(5, 8) },
        { type: "declarator", location: rangeLocation(9, 10) },
        { type: "expression", id: "bind", location: rangeLocation(11, 17) },
        { type: "statement ending", location: rangeLocation(18, 19) },
      ],
      groupParsers,
    ),
    {
      consumed: 4,
      ast: leaksNames(
        {
          type: "declaration",
          name: { type: "name", name: "Foo", location: rangeLocation(5, 8) },
          bind: {
            type: "expression",
            id: "bind",
            location: rangeLocation(11, 17),
          },
          location: rangeLocation(5, 19),
        },
        ["Foo"],
      ),
    },
  )
})

test("ignores expressions not starting with a name", t => {
  t.deepEqual(
    parsers.parseDeclaration(
      [
        { type: "word", word: "foo" },
        { type: "declarator" },
        { type: "expression", id: "bind" },
        { type: "statement ending" },
      ],
      groupParsers,
    ),
    {
      consumed: 0,
      errors: [],
    },
  )
})

const tokens = [
  { type: "name", name: "Foo", location: rangeLocation(5, 8) },
  { type: "declarator", location: rangeLocation(9, 10) },
  { type: "expression", id: "bind", location: rangeLocation(11, 17) },
  { type: "statement ending", location: rangeLocation(18, 19) },
  { type: "other", location: rangeLocation(20, 26) },
]

const testMissingToken = (
  t: ExecutionContext,
  missingTokenIndex: number,
  error: any,
) => {
  t.deepEqual(
    parsers.parseDeclaration(
      tokens.filter((_token, i) => i !== missingTokenIndex),
      groupParsers,
    ),
    {
      consumed: 0,
      errors: [error],
    },
  )
}

const testEOF = (
  t: ExecutionContext,
  missingTokenIndex: number,
  error: any,
) => {
  t.deepEqual(
    parsers.parseDeclaration(tokens.slice(0, missingTokenIndex), groupParsers),
    {
      consumed: 0,
      errors: [error],
    },
  )
}

test(
  "errors when declarator is missing",
  testMissingToken,
  1,
  locatedError(
    "Expected declarator, but got 'expression'",
    rangeLocation(11, 17),
  ),
)

test(
  "errors when there is EOF instead of declarator",
  testEOF,
  1,
  locatedError(
    "Expected declarator, but got eof instead!",
    rangeLocation(5, 8),
  ),
)

test(
  "errors when bind is missing",
  testMissingToken,
  2,
  locatedError(
    "Expected expression, but got 'statement ending'",
    rangeLocation(18, 19),
  ),
)

test(
  "errors when there is EOF instead of bind",
  testEOF,
  2,
  locatedError(
    "Expected expression, but got eof instead!",
    rangeLocation(5, 10),
  ),
)

test(
  "errors when statement ending is missing",
  testMissingToken,
  3,
  locatedError(
    "Expected statement ending, but got 'other'",
    rangeLocation(20, 26),
  ),
)

test(
  "errors when there is EOF instead of statement ending",
  testEOF,
  3,
  locatedError(
    "Expected statement ending, but got eof instead!",
    rangeLocation(5, 17),
  ),
)
