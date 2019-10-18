import test from "ava"
import { nameToWords, wordsToName } from "./words"

test("nameToWords", t => {
  t.deepEqual(nameToWords("Foo_Bar_Baz32"), ["foo", "bar", "baz32"])
})

test("wordsToName", t => {
  t.deepEqual(wordsToName(["foo", "bar", "baz32"]), "Foo_Bar_Baz32")
})
