import test from "ava"
import { parsers } from "./functionCalls"
import { rangeLocation } from "../lib/location"

test("can parse 1 word", t => {
  t.deepEqual(
    parsers.parseWords(
      [{ type: "word", word: "foo", location: rangeLocation(0, 4) }],
      {},
    ),
    {
      consumed: 1,
      ast: {
        type: "function call",
        callee: {
          type: "name",
          name: "Foo",
          location: rangeLocation(0, 4),
        },
        args: [],
        location: rangeLocation(0, 4),
      },
    },
  )
})

test("can parse 2 words", t => {
  t.deepEqual(
    parsers.parseWords(
      [
        { type: "word", word: "foo", location: rangeLocation(0, 4) },
        { type: "word", word: "bar", location: rangeLocation(5, 9) },
      ],
      {},
    ),
    {
      consumed: 2,
      ast: {
        type: "function call",
        callee: {
          type: "name",
          name: "Foo_Bar",
          location: rangeLocation(0, 9),
        },
        args: [],
        location: rangeLocation(0, 9),
      },
    },
  )
})

test("can parse a name and a word", t => {
  t.deepEqual(
    parsers.parseWords(
      [
        { type: "name", name: "Foo", location: rangeLocation(0, 4) },
        { type: "word", word: "bar", location: rangeLocation(5, 9) },
      ],
      {},
    ),
    {
      consumed: 2,
      ast: {
        type: "function call",
        callee: {
          type: "name",
          name: "Foo_Bar",
          location: rangeLocation(0, 9),
        },
        args: [{ type: "name", name: "Foo", location: rangeLocation(0, 4) }],
        location: rangeLocation(0, 9),
      },
    },
  )
})

test("can parse 1 word with big expression", t => {
  t.deepEqual(
    parsers.parseWords(
      [
        { type: "word", word: "foo", location: rangeLocation(0, 4) },
        { type: "left paren", location: rangeLocation(5, 6) },
        { type: "stuff" },
        { type: "stuff" },
        { type: "stuff" },
        { type: "stuff" },
        { type: "stuff" },
        { type: "right paren", location: rangeLocation(19, 20) },
      ],
      {
        parseWords: () => ({
          consumed: 7,
          ast: {
            type: "parens",
            values: [
              {
                type: "lots of stuff",
                location: rangeLocation(6, 19),
              },
            ],
            location: rangeLocation(5, 20),
          },
        }),
      },
    ),
    {
      consumed: 8,
      ast: {
        type: "function call",
        callee: {
          type: "name",
          name: "Foo",
          location: rangeLocation(0, 4),
        },
        args: [
          {
            type: "lots of stuff",
            location: rangeLocation(6, 19),
          },
        ],
        location: rangeLocation(0, 20),
      },
    },
  )
})
