import test from "ava"
import { evalResult } from "./testHelpers"

test(evalResult, "require.sweet", { Array_Result: [1, 2, 3] })
