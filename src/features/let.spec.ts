import test, { ExecutionContext } from "ava"
import { parsers, compileToJs } from "./let"
import { locatedError } from "../lib/error"
import { rangeLocation } from "../lib/location"
import { something } from "../lib/maybe"
import { error, ok } from "../lib/result"

const groupParsers = {
  parseExpression: ([token]) =>
    token && token.type === "expression"
      ? { consumed: 1, ast: token }
      : { consumed: 0, errors: [] },
  parseDeclaration: ([token]) =>
    token && token.type === "declaration"
      ? { consumed: 1, ast: token }
      : { consumed: 0, errors: [] },
}

const tokens = [
  { type: "word", word: "let", location: rangeLocation(0, 4) },
  {
    type: "declaration",
    name: "Foo",
    bind: "bind",
    location: rangeLocation(5, 19),
  },
  { type: "expression", id: "body", location: rangeLocation(20, 26) },
  { type: "other", location: rangeLocation(29, 30) },
]

test("can parse a let expression", t => {
  t.deepEqual(parsers.parseConstruction(tokens, groupParsers), {
    consumed: 3,
    ast: {
      type: "let",
      declaration: {
        type: "declaration",
        name: "Foo",
        bind: "bind",
        location: rangeLocation(5, 19),
      },
      body: {
        type: "expression",
        id: "body",
        location: rangeLocation(20, 26),
      },
      location: rangeLocation(0, 26),
    },
  })
})

test("ignores expressions not starting with let", t => {
  t.deepEqual(
    parsers.parseConstruction(
      [
        { type: "word", word: "foo" },
        {
          type: "declaration",
          name: "Foo",
          bind: { type: "expression", id: "bind" },
        },
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

const testMissingToken = (
  t: ExecutionContext,
  missingTokenIndex: number,
  error: any,
) => {
  t.deepEqual(
    parsers.parseConstruction(
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
    parsers.parseConstruction(tokens.slice(0, missingTokenIndex), groupParsers),
    {
      consumed: 0,
      errors: [error],
    },
  )
}

test(
  "errors when declaration is missing",
  testMissingToken,
  1,
  locatedError(
    "Expected declaration, but got 'expression'",
    rangeLocation(20, 26),
  ),
)

test(
  "errors when there is EOF instead of declaration",
  testEOF,
  1,
  locatedError(
    "Expected declaration, but got eof instead!",
    rangeLocation(0, 4),
  ),
)

test(
  "errors when body is missing",
  testMissingToken,
  2,
  locatedError("Expected expression, but got 'other'", rangeLocation(29, 30)),
)

test(
  "errors when there is EOF instead of body",
  testEOF,
  2,
  locatedError(
    "Expected expression, but got eof instead!",
    rangeLocation(0, 19),
  ),
)

test("errors when a let shadows a variable", t => {
  t.deepEqual(
    compileToJs(
      {
        type: "let",
        declaration: {
          type: "declaration",
          name: { type: "name", name: "Foo", location: rangeLocation(5, 8) },
          bind: {
            type: "expression",
            id: "bind",
            location: rangeLocation(11, 17),
          },
          location: rangeLocation(5, 19),
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
