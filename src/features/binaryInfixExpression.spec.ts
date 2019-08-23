import test from "ava"
import { parseOperation } from "./binaryInfixExpression"
import { something, nothing } from "../lib/maybe"

const groupParsers = {
  parseValue: ([token]) => ({ consumed: 1, ast: token }),
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
    parseOperation(
      [{ type: "1" }, { type: "+" }, { type: "1" }],
      groupParsers,
      precedenceMatcherGroups,
    ),
    {
      consumed: 3,
      ast: {
        type: "binary arithmetic operator",
        operator: "add",
        leftHandSide: { type: "1" },
        rightHandSide: { type: "1" },
      },
    },
  )
})

test("can parse 1 + 2 - 3", t => {
  t.deepEqual(
    parseOperation(
      [
        { type: "1" },
        { type: "+" },
        { type: "2" },
        { type: "-" },
        { type: "3" },
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
          leftHandSide: { type: "1" },
          rightHandSide: { type: "2" },
        },
        rightHandSide: { type: "3" },
      },
    },
  )
})

test("can parse 1 + 2 * 3", t => {
  t.deepEqual(
    parseOperation(
      [
        { type: "1" },
        { type: "+" },
        { type: "2" },
        { type: "*" },
        { type: "3" },
      ],
      groupParsers,
      precedenceMatcherGroups,
    ),
    {
      consumed: 5,
      ast: {
        type: "binary arithmetic operator",
        operator: "add",
        leftHandSide: { type: "1" },
        rightHandSide: {
          type: "binary arithmetic operator",
          operator: "multiply",
          leftHandSide: { type: "2" },
          rightHandSide: { type: "3" },
        },
      },
    },
  )
})
