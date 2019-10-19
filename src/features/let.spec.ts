import test, { ExecutionContext } from "ava"
import { parseConstruction, compileToJs } from "./let"
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

test("can parse a let expression", t => {
  t.deepEqual(
    parseConstruction(
      [
        { type: "word", word: "let", location: rangeLocation(0, 4) },
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
    },
  )
})

test("ignores expressions not starting with let", t => {
  t.deepEqual(
    parseConstruction(
      [
        { type: "word", word: "foo" },
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
  { type: "word", word: "let", location: rangeLocation(0, 4) },
  { type: "name", name: "Foo", location: rangeLocation(5, 8) },
  { type: "declarator", location: rangeLocation(9, 10) },
  { type: "expression", id: "bind", location: rangeLocation(11, 17) },
  { type: "statement ending", location: rangeLocation(18, 19) },
  { type: "expression", id: "body", location: rangeLocation(20, 26) },
  { type: "other", location: rangeLocation(29, 30) },
]

const testMissingToken = (
  t: ExecutionContext,
  missingTokenIndex: number,
  error: any,
) => {
  t.deepEqual(
    parseConstruction(
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
    parseConstruction(tokens.slice(0, missingTokenIndex), groupParsers),
    {
      consumed: 0,
      errors: [error],
    },
  )
}

test(
  "errors when name is missing",
  testMissingToken,
  1,
  locatedError(
    "Expected declaration, but got 'declarator'",
    rangeLocation(9, 10),
  ),
)

test(
  "errors when there is EOF instead of name",
  testEOF,
  1,
  locatedError(
    "Expected declaration, but got eof instead!",
    rangeLocation(0, 4),
  ),
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
    rangeLocation(5, 8),
  ),
)

test(
  "errors when bind is missing",
  testMissingToken,
  3,
  locatedError(
    "Expected expression, but got 'statement ending'",
    rangeLocation(18, 19),
  ),
)

test(
  "errors when there is EOF instead of bind",
  testEOF,
  3,
  locatedError(
    "Expected expression, but got eof instead!",
    rangeLocation(5, 10),
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
    rangeLocation(5, 17),
  ),
)

test(
  "errors when body is missing",
  testMissingToken,
  5,
  locatedError("Expected expression, but got 'other'", rangeLocation(29, 30)),
)

test(
  "errors when there is EOF instead of body",
  testEOF,
  5,
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
