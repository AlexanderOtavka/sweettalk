import { assertSomething } from "./maybe"
import firstSomething from "./firstSomething"
import { locationLeftBound, locationRightBound } from "./location"
import { Result } from "./result"

export const startEndFromLocation = (location: any) => ({
  start: locationLeftBound(location),
  end: locationRightBound(location),
})

const compileWithBlock = (
  ast: any,
  environment: any,
  block: any[],
  compilers: readonly any[],
): Result<any, any> =>
  assertSomething(
    firstSomething(compilers, compile =>
      compile(
        ast,
        environment,
        block,
        (ast: any, environment: any, block: any[]) =>
          compileWithBlock(ast, environment, block, compilers),
      ),
    ),
    `Nothing matched ${ast.type}`,
  )

export const compileAstToJs = (
  ast: any,
  environment: any,
  compilers: readonly any[],
) => compileWithBlock(ast, environment, null, compilers)
