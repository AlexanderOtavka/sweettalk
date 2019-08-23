import { assertSomething } from "./maybe"
import firstSomething from "./firstSomething"

export const compileAstToJs = (ast: any, compilers: readonly any[]) =>
  assertSomething(
    firstSomething(compilers, compile =>
      compile(ast, (ast: any) => compileAstToJs(ast, compilers)),
    ),
    `failed to compile: ${ast}`,
  )
