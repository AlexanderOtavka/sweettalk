import test from "ava"
import { parsers } from "./program"
import { rangeLocation } from "../lib/location"
import { locatedError } from "../lib/error"
import { leaksNames } from "../lib/leakyNames"

const parserGroups = {
  parseStatement: ([token]) =>
    token && token.type === "statement"
      ? { consumed: 1, ast: token }
      : { consumed: 0, errors: [] },
}

test("parses a few statements", t => {
  t.deepEqual(
    parsers.parseProgram(
      [
        { type: "statement", location: rangeLocation(0, 5) },
        { type: "statement", location: rangeLocation(6, 10) },
        { type: "statement", location: rangeLocation(11, 15) },
      ],
      parserGroups,
    ),
    {
      consumed: 3,
      ast: leaksNames(
        {
          type: "program",
          body: [
            { type: "statement", location: rangeLocation(0, 5) },
            { type: "statement", location: rangeLocation(6, 10) },
            { type: "statement", location: rangeLocation(11, 15) },
          ],
          location: rangeLocation(0, 15),
        },
        [],
      ),
    },
  )
})

test("parse passes through errors", t => {
  t.deepEqual(
    parsers.parseProgram(
      [{ type: "statement", location: rangeLocation(0, 5) }],
      {
        parseStatement: () => ({ consumed: 0, errors: ["I'm an error"] }),
      },
    ),
    { consumed: 0, errors: ["I'm an error"] },
  )
})

test("parse complains when it can't get the whole program", t => {
  t.deepEqual(
    parsers.parseProgram(
      [
        { type: "statement", location: rangeLocation(0, 5) },
        { type: "bad thingy", location: rangeLocation(6, 10) },
      ],
      parserGroups,
    ),
    {
      consumed: 0,
      errors: [locatedError("Unexpected bad thingy", rangeLocation(6, 10))],
    },
  )
})
