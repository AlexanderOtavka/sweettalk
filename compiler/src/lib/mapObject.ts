const mapObject = (
  object: object,
  transform: (value: any, key: string, object: any) => any,
) => {
  const newObject = {}
  for (const key in object) {
    if (Object.prototype.hasOwnProperty.call(object, key)) {
      newObject[key] = transform(object[key], key, object)
    }
  }

  return newObject
}

export default mapObject
