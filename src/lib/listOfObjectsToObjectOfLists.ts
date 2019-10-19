const listOfObjectsToObjectOfLists = (list: readonly any[]) => {
  const allKeys = [
    ...new Set(
      list
        .map(Object.keys)
        .reduce((apis, featureApi) => [...apis, ...featureApi]),
    ),
  ]

  return Object.assign(
    {},
    ...allKeys.map(key => ({
      [key]: list.map(object => object[key]).filter(Boolean),
    })),
  )
}

export default listOfObjectsToObjectOfLists
