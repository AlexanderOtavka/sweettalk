import test from "ava"
import { parsers } from "./binaryInfixExpression"
import { something, nothing } from "../lib/maybe"
import { locatedError } from "../lib/error"
import { rangeLocation } from "../lib/location"

const groupParsers = {
  parseConstruction: ([token]) =>
    token && !isNaN(+token.type)
      ? { consumed: 1, ast: token }
      : { consumed: 0, errors: [] },
}
const precedenceMatcherGroups = [
  [
    (token: { type: string }) => {
      if (token.type === "+") {
        return something("add")
      } else {
        return nothing
      }
    },
    (token: { type: string }) => {
      if (token.type === "-") {
        return something("subtract")
      } else {
        return nothing
      }
    },
  ],
  [
    (token: { type: string }) => {
      if (token.type === "*") {
        return something("multiply")
      } else {
        return nothing
      }
    },
  ],
]

test("can parse 1 + 1", t => {
  t.deepEqual(
    parsers.parseOperation(
      [
        { type: "1", location: rangeLocation(0, 1) },
        { type: "+", location: rangeLocation(2, 3) },
        { type: "1", location: rangeLocation(4, 5) },
      ],
      groupParsers,
      precedenceMatcherGroups,
    ),
    {
      consumed: 3,
      ast: {
        type: "binary arithmetic operator",
        operator: "add",
        leftHandSide: { type: "1", location: rangeLocation(0, 1) },
        rightHandSide: { type: "1", location: rangeLocation(4, 5) },
        location: rangeLocation(0, 5),
      },
    },
  )
})

test("can parse 1 + 2 - 3", t => {
  t.deepEqual(
    parsers.parseOperation(
      [
        { type: "1", location: rangeLocation(0, 1) },
        { type: "+", location: rangeLocation(2, 3) },
        { type: "2", location: rangeLocation(4, 5) },
        { type: "-", location: rangeLocation(6, 7) },
        { type: "3", location: rangeLocation(8, 9) },
      ],
      groupParsers,
      precedenceMatcherGroups,
    ),
    {
      consumed: 5,
      ast: {
        type: "binary arithmetic operator",
        operator: "subtract",
        leftHandSide: {
          type: "binary arithmetic operator",
          operator: "add",
          leftHandSide: { type: "1", location: rangeLocation(0, 1) },
          rightHandSide: { type: "2", location: rangeLocation(4, 5) },
          location: rangeLocation(0, 5),
        },
        rightHandSide: { type: "3", location: rangeLocation(8, 9) },
        location: rangeLocation(0, 9),
      },
    },
  )
})

test("can parse 1 + 2 * 3", t => {
  t.deepEqual(
    parsers.parseOperation(
      [
        { type: "1", location: rangeLocation(0, 1) },
        { type: "+", location: rangeLocation(2, 3) },
        { type: "2", location: rangeLocation(4, 5) },
        { type: "*", location: rangeLocation(6, 7) },
        { type: "3", location: rangeLocation(8, 9) },
      ],
      groupParsers,
      precedenceMatcherGroups,
    ),
    {
      consumed: 5,
      ast: {
        type: "binary arithmetic operator",
        operator: "add",
        leftHandSide: { type: "1", location: rangeLocation(0, 1) },
        rightHandSide: {
          type: "binary arithmetic operator",
          operator: "multiply",
          leftHandSide: { type: "2", location: rangeLocation(4, 5) },
          rightHandSide: { type: "3", location: rangeLocation(8, 9) },
          location: rangeLocation(4, 9),
        },
        location: rangeLocation(0, 9),
      },
    },
  )
})

test("errors on end of input", t => {
  t.deepEqual(
    parsers.parseOperation(
      [{ type: "1" }, { type: "+", location: rangeLocation(2, 3) }],
      groupParsers,
      precedenceMatcherGroups,
    ),
    {
      consumed: 0,
      errors: [
        locatedError(
          "Expected an expression after the 'add', but hit the end of the file instead!",
          rangeLocation(2, 3),
        ),
      ],
    },
  )
})
