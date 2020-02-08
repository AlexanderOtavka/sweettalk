import test from "ava"
import { compileError } from "./testHelpers"
import { locatedError } from "../lib/error"
import { rangeLocation } from "../lib/location"

test(compileError, "./eof_error.sweet", [
  locatedError(
    "Expected an expression after the 'divide', but hit the end of the file instead!",
    rangeLocation(36, 37),
  ),
])
