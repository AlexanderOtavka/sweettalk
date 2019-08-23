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

const compileString = (fileString: string) => {
  const features = loadFeatures(path.join(__dirname, "./features"), {
    readdirSync,
    require,
  })

  return pipe(lexFileWithLexers(fileString, features.lex)).through(
    that =>
      forOkResult(that, tokens => ok(preParse(tokens, features.preParse))),
    that =>
      forOkResult(that, preParsedTokens =>
        parseProgram(
          preParsedTokens,
          injectParserDependency(features, "parseOperation", [
            features.translateTermOperator,
            features.translateFactorOperator,
          ]),
          ["parseOperation", "parseValue"],
        ),
      ),
    that =>
      forOkResult(that, ast => ok(compileAstToJs(ast, features.compileToJs))),
    that => forOkResult(that, jsAst => ok(generate(jsAst))),
  )
}

export default compileString
