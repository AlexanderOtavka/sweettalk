import { ExecutionContext } from "ava"
import fs from "fs"
import path from "path"
import compileString from "../compileString"
import { assertOk, Result, error } from "../lib/result"
import pipe from "../lib/pipe"

const loadCode = (filename: string) =>
  fs.readFileSync(path.join("./src/e2e", filename), "utf8")

export const evalResult = (
  t: ExecutionContext,
  filename: string,
  expectedResult: any,
) => {
  t.deepEqual(
    // tslint:disable-next-line:no-eval
    pipe(filename).through(
      loadCode,
      compileString,
      assertOk,
      program => `
        const module = {exports: {}};
        ${program};
        module.exports
      `,
      eval,
    ),
    expectedResult,
  )
}

evalResult.title = () => "eval result"

export const compileError = (
  t: ExecutionContext,
  filename: string,
  expectedResult: Result<never, any>,
) => {
  t.deepEqual(
    // tslint:disable-next-line:no-eval
    compileString(loadCode(filename)),
    error(expectedResult),
  )
}

compileError.title = () => "compile error"
