import { readdirSync } from "fs"
import path from "path"
import { generate } from "astring"
import loadFeatures from "./lib/loadFeatures"
import { lexFileWithLexers } from "./lib/lex"
import { preParse } from "./lib/preParse"
import { parseProgram, injectParserDependency } from "./lib/parse"
import { compileAstToJs } from "./lib/compile"
import { ok, forOkResult } from "./lib/result"
import pipe from "./lib/pipe"

const environment = {
  Require: "require",
}

const compileString = (fileString: string) => {
  const features = loadFeatures(path.join(__dirname, "./features"), {
    readdirSync,
    require,
  })

  return pipe(lexFileWithLexers(fileString, features.lex)).through(
    that =>
      forOkResult(that, tokens => {
        return ok(preParse(tokens, features.preParse))
      }),
    that =>
      forOkResult(that, preParsedTokens => {
        return parseProgram(
          preParsedTokens,
          pipe(features).through(that =>
            injectParserDependency(that, "parseOperation", [
              features.translateTermOperator,
              features.translateFactorOperator,
            ]),
          ),
          [
            "parseExpression",
            "parseOperation",
            "parseConstruction",
            "parseWords",
            "parseValue",
          ],
        )
      }),
    that =>
      forOkResult(that, ast => {
        return compileAstToJs(ast, environment, features.compileToJs)
      }),
    that =>
      forOkResult(that, jsAst => {
        return ok(generate(jsAst))
      }),
  )
}

export default compileString
