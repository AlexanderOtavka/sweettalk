import { assertSomething } from "./maybe"
import firstSomething from "./firstSomething"

const compileWithBlock = (
  ast: any,
  environment: any,
  block: any[],
  compilers: readonly any[],
) =>
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
    `failed to compile ${ast.type}`,
  )

export const compileAstToJs = (
  ast: any,
  environment: any,
  compilers: readonly any[],
) => {
  const block = []
  const expression = compileWithBlock(ast, environment, block, compilers)
  return {
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
  }
}
