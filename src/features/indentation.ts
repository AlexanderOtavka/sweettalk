export const lex = (subFile: string) => {
  const matchFromSpacesOrTabs = (str: string) => {
    if (str[0] === " ") {
      const { consumed, value } = matchFromSpacesOrTabs(str.substring(1))
      return { consumed: consumed + 1, value: " " + value }
    } else if (str[0] === "\t") {
      const { consumed, value } = matchFromSpacesOrTabs(str.substring(1))
      return { consumed: consumed + 1, value: "\t" + value }
    } else {
      return { consumed: 0, value: "" }
    }
  }

  const matchFromLf = (str: string) => {
    if (str[0] === "\n") {
      const { consumed, value } = matchFromSpacesOrTabs(str.substring(1))
      return { consumed: consumed + 1, value }
    } else {
      return { consumed: 0, value: "" }
    }
  }

  const matchFromCrMaybe = (str: string) => {
    if (str[0] === "\r") {
      const { consumed, value } = matchFromLf(str.substring(1))
      if (consumed > 0) {
        return { consumed: consumed + 1, value }
      } else {
        return { consumed: 0, value: "" }
      }
    } else {
      return matchFromLf(str)
    }
  }

  const { consumed, value } = matchFromCrMaybe(subFile)
  if (consumed > 0) {
    return { consumed, newToken: { type: "indent", value } }
  } else {
    return { consumed: 0 }
  }
}
