import { ExecutionContext } from "ava"
import fs from "fs"
import path from "path"
import compileString from "../compileString"
import { assertOk } from "../lib/result"

export const evalResult = (
  t: ExecutionContext,
  filename: string,
  expectedResult: any,
) => {
  const code = fs.readFileSync(path.join("./src/e2e", filename), "utf8")
  t.deepEqual(
    // tslint:disable-next-line:no-eval
    eval(assertOk(compileString(code))),
    expectedResult,
  )
}

evalResult.title = () => "eval result"
