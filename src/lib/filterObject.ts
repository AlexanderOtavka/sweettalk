const filterObject = (
  object: object,
  predicate: (value: any, key: string, object: any) => boolean,
) => {
  const newObject = {}
  for (const key in object) {
    if (
      Object.prototype.hasOwnProperty.call(object, key) &&
      predicate(object[key], key, object)
    ) {
      newObject[key] = object[key]
    }
  }

  return newObject
}

export default filterObject
