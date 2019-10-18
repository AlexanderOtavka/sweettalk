import test from "ava"
import { parseWords } from "./functionCalls"
import { rangeLocation } from "../lib/location"

test("can parse 1 word", t => {
  t.deepEqual(
    parseWords(
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

test("can parse 1 word with big expression", t => {
  t.deepEqual(
    parseWords(
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
