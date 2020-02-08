import fs from "fs"
import compileString from "./compileString"
import { isOk } from "./lib/result"
import { locatedErrorToString } from "./lib/error"

const [, , inputFile, outputFile] = process.argv

const inputCode = fs.readFileSync(inputFile, "utf8")
const compileResult = compileString(inputCode)
if (isOk(compileResult)) {
  fs.writeFileSync(
    outputFile,
    `${compileResult.value}
    // Injected by index.ts
    console.log(exports);\n`,
  )
} else {
  for (const error of compileResult.message) {
    process.stderr.write(locatedErrorToString(error, inputCode) + "\n")
  }
}
