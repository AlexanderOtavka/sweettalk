import test from "ava"
import { evalResult } from "./testHelpers"

test(evalResult, "addition.sweet", { Sum: 2 })
