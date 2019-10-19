import test from "ava"
import { parseProgramWithFeatures } from "./parse"
import { ok } from "./result"

test("parseProgramWithFeatures can parse a single token", t => {
  t.deepEqual(
    parseProgramWithFeatures(
      [{ type: "a single value" }],
      { parseValue: [([ast], _parsers: any) => ({ consumed: 1, ast })] },
      ["parseValue"],
      [],
    ),
    ok({ type: "a single value" }),
  )
})
