import test from "ava"
import { evalResult } from "./testHelpers"

test(evalResult, "arithmetic.sweet", { Result: -11 })
