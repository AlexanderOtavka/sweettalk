import test from "ava"
import { evalResult } from "./testHelpers"

test(evalResult, "let.sweet", { Result: 3 })
