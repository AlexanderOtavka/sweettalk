export const numberToken = (value: number) => ({
  type: "literal",
  kind: "number",
  value,
})

export const lex = (subFile: string) => {
  const match = subFile.match(/^\d([\d,]*\d)?(\.\d([\d,]*\d)?)?/)
  if (match) {
    return {
      consumed: match[0].length,
      newToken: numberToken(+match[0].replace(/,/g, "")),
    }
  } else {
    return { consumed: 0 }
  }
}
