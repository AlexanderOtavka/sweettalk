import test, { ExecutionContext } from "ava"
import { lex, parseValue, compileToJs } from "./let"
import { locatedError } from "../lib/error"
import { rangeLocation } from "../lib/location"
import { something } from "../lib/maybe"
import { error, ok } from "../lib/result"

const groupParsers = {
  parseExpression: ([token]) =>
    token && token.type === "expression"
      ? { consumed: 1, ast: token }
      : { consumed: 0, errors: [] },
}

test("can lex 'let'", t => {
  t.deepEqual(lex("let foo"), {
    consumed: 3,
    newToken: { type: "let" },
  })
})

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

test("can parse a let expression", t => {
  t.deepEqual(
    parseValue(
      [
        { type: "let", location: rangeLocation(0, 4) },
        { type: "name", name: "Foo", location: rangeLocation(5, 8) },
        { type: "declarator", location: rangeLocation(9, 10) },
        { type: "expression", id: "bind", location: rangeLocation(11, 17) },
        { type: "statement ending", location: rangeLocation(18, 19) },
        { type: "expression", id: "body", location: rangeLocation(20, 26) },
      ],
      groupParsers,
    ),
    {
      consumed: 6,
      ast: {
        type: "let",
        name: { type: "name", name: "Foo", location: rangeLocation(5, 8) },
        bind: {
          type: "expression",
          id: "bind",
          location: rangeLocation(11, 17),
        },
        body: {
          type: "expression",
          id: "body",
          location: rangeLocation(20, 26),
        },
        location: rangeLocation(0, 26),
      },
    },
  )
})

test("ignores expressions not starting with let", t => {
  t.deepEqual(
    parseValue(
      [
        { type: "foo" },
        { type: "name", name: "Foo" },
        { type: "declarator" },
        { type: "expression", id: "bind" },
        { type: "statement ending" },
        { type: "expression", id: "body" },
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
  { type: "let", location: rangeLocation(0, 4) },
  { type: "name", name: "Foo", location: rangeLocation(5, 8) },
  { type: "declarator", location: rangeLocation(9, 10) },
  { type: "expression", id: "bind", location: rangeLocation(11, 17) },
  { type: "statement ending", location: rangeLocation(18, 19) },
  { type: "expression", id: "body", location: rangeLocation(20, 26) },
]

const testMissingToken = (
  t: ExecutionContext,
  missingTokenIndex: number,
  error: any,
) => {
  t.deepEqual(
    parseValue(
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
  t.deepEqual(parseValue(tokens.slice(0, missingTokenIndex), groupParsers), {
    consumed: 0,
    errors: [error],
  })
}

test(
  "errors when name is missing",
  testMissingToken,
  1,
  locatedError("Expected name, but got 'declarator'", rangeLocation(9, 10)),
)

test(
  "errors when there is EOF instead of name",
  testEOF,
  1,
  locatedError("Expected name, but got eof instead!", rangeLocation(0, 4)),
)

test(
  "errors when declarator is missing",
  testMissingToken,
  2,
  locatedError(
    "Expected declarator, but got 'expression'",
    rangeLocation(11, 17),
  ),
)

test(
  "errors when there is EOF instead of declarator",
  testEOF,
  2,
  locatedError(
    "Expected declarator, but got eof instead!",
    rangeLocation(0, 8),
  ),
)

test(
  "errors when statement ending is missing",
  testMissingToken,
  4,
  locatedError(
    "Expected statement ending, but got 'expression'",
    rangeLocation(20, 26),
  ),
)

test(
  "errors when there is EOF instead of statement ending",
  testEOF,
  4,
  locatedError(
    "Expected statement ending, but got eof instead!",
    rangeLocation(0, 17),
  ),
)

test("errors when a let shadows a variable", t => {
  t.deepEqual(
    compileToJs(
      {
        type: "let",
        name: { type: "name", name: "Foo", location: rangeLocation(5, 8) },
        bind: {
          type: "expression",
          id: "bind",
          location: rangeLocation(11, 17),
        },
        body: {
          type: "expression",
          id: "body",
          location: rangeLocation(20, 26),
        },
        location: rangeLocation(0, 26),
      },
      { Foo: "Foo__0" },
      [],
      x => ok(x),
    ),
    something(
      error([
        locatedError(
          "There is already a variable named 'Foo'",
          rangeLocation(5, 8),
        ),
      ]),
    ),
  )
})
