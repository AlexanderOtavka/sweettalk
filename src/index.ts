import fs from "fs"
import compileString from "./compileString"
import { assertOk } from "./lib/result"

const [, inputFile, outputFile] = process.argv

const inputCode = fs.readFileSync(inputFile, "utf8")
const outputCode = assertOk(compileString(inputCode))
fs.writeFileSync(outputFile, outputCode)
