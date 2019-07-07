import test from "ava"
import { fake } from "sinon"
import { ok, error, forOkResult } from "./result"

test("forOkResult operates on ok values", t => {
  t.deepEqual(forOkResult(ok(5), (x: number) => ok(x + 1)), ok(6))
})

test("forOkResult passes through an error", t => {
  const callback = fake()
  t.deepEqual(forOkResult(error("foo"), callback), error("foo"))
  t.false(callback.called)
})
