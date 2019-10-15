import fs from "fs"
import compileString from "./compileString"
import { isOk } from "./lib/result"
import { locatedErrorToString } from "./lib/error"

const [, , inputFile, outputFile] = process.argv

const inputCode = fs.readFileSync(inputFile, "utf8")
const compileResult = compileString(inputCode)
if (isOk(compileResult)) {
  fs.writeFileSync(outputFile, `console.log(${compileResult.value})`)
} else {
  for (const error of compileResult.message) {
    process.stderr.write(locatedErrorToString(error, inputCode) + "\n")
  }
}
