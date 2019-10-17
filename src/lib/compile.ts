import { assertSomething } from "./maybe"
import firstSomething from "./firstSomething"
import { locationLeftBound, locationRightBound } from "./location"
import { forOkResult, ok, Result } from "./result"

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
) => {
  const block = []
  return forOkResult(
    compileWithBlock(ast, environment, block, compilers),
    expression =>
      ok({
        type: "Program",
        sourceType: "module",
        body: [
          ...block,
          {
            type: "ExpressionStatement",
            expression: {
              type: "AssignmentExpression",
              operator: "=",
              left: {
                type: "MemberExpression",
                computed: false,
                object: { type: "Identifier", name: "module" },
                property: { type: "Identifier", name: "exports" },
              },
              right: expression,
            },
          },
        ],
      }),
  )
}
