import match from "./match"

export const singleLocation = (value: number) => ({
  type: "single location",
  value,
})
export const rangeLocation = (left: number, right: number) => ({
  type: "range location",
  left,
  right,
})

const locationNumberToRowColumn = (location: number, sourceCode: string) => {
  if (location >= sourceCode.length) {
    throw Error(`Location (${location}) out of bounds`)
  }

  let row = 1
  let column = 1
  for (let i = 0; i < location; i++) {
    if (sourceCode[i] === "\n") {
      row++
      column = 1
    } else {
      column++
    }
  }

  return { row, column }
}

export const locationToString = (location: any, sourceCode: string) =>
  match(location.type, [
    [
      "single location",
      _ => {
        const { row, column } = locationNumberToRowColumn(
          location.value,
          sourceCode,
        )
        return `(${row}:${column})`
      },
    ],
    [
      "range location",
      _ => {
        const left = locationNumberToRowColumn(location.left, sourceCode)
        const right = locationNumberToRowColumn(location.right, sourceCode)
        return `(${left.row}:${left.column} to ${right.row}:${right.column})`
      },
    ],
  ])
