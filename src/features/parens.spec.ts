import test from "ava"
import { parseWords } from "./parens"
import { rangeLocation } from "../lib/location"

const parsers = {
  parseExpression: ([token]) =>
    token.type === "expression"
      ? { consumed: 1, ast: token }
      : { consumed: 0, errors: [] },
}

test("parses empty parens", t => {
  t.deepEqual(
    parseWords(
      [
        { type: "left paren", location: rangeLocation(0, 1) },
        { type: "right paren", location: rangeLocation(1, 2) },
      ],
      parsers,
    ),
    {
      consumed: 2,
      ast: {
        type: "parens",
        hasTrailingComma: false,
        trailingCommaLocation: null,
        values: [],
        location: rangeLocation(0, 2),
      },
    },
  )
})

test("parses parens with 1 expression", t => {
  t.deepEqual(
    parseWords(
      [
        { type: "left paren", location: rangeLocation(0, 1) },
        { type: "expression", location: rangeLocation(1, 5) },
        { type: "right paren", location: rangeLocation(5, 6) },
      ],
      parsers,
    ),
    {
      consumed: 3,
      ast: {
        type: "parens",
        hasTrailingComma: false,
        trailingCommaLocation: null,
        values: [{ type: "expression", location: rangeLocation(1, 5) }],
        location: rangeLocation(0, 6),
      },
    },
  )
})

test("parses parens with 1 expression and trailing comma", t => {
  t.deepEqual(
    parseWords(
      [
        { type: "left paren", location: rangeLocation(0, 1) },
        { type: "expression", location: rangeLocation(1, 5) },
        { type: "comma", location: rangeLocation(5, 6) },
        { type: "right paren", location: rangeLocation(6, 7) },
      ],
      parsers,
    ),
    {
      consumed: 4,
      ast: {
        type: "parens",
        hasTrailingComma: true,
        trailingCommaLocation: rangeLocation(5, 6),
        values: [{ type: "expression", location: rangeLocation(1, 5) }],
        location: rangeLocation(0, 7),
      },
    },
  )
})

test("parses parens with 3 expressions", t => {
  t.deepEqual(
    parseWords(
      [
        { type: "left paren", location: rangeLocation(0, 1) },
        { type: "expression", location: rangeLocation(1, 5) },
        { type: "comma", location: rangeLocation(5, 6) },
        { type: "expression", location: rangeLocation(7, 12) },
        { type: "comma", location: rangeLocation(12, 13) },
        { type: "expression", location: rangeLocation(14, 20) },
        { type: "right paren", location: rangeLocation(20, 21) },
      ],
      parsers,
    ),
    {
      consumed: 7,
      ast: {
        type: "parens",
        hasTrailingComma: false,
        trailingCommaLocation: null,
        values: [
          { type: "expression", location: rangeLocation(1, 5) },
          { type: "expression", location: rangeLocation(7, 12) },
          { type: "expression", location: rangeLocation(14, 20) },
        ],
        location: rangeLocation(0, 21),
      },
    },
  )
})
