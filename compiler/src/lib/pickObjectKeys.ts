import filterObject from "./filterObject"

const pickObjectKeys = (object: object, keys: readonly string[]) =>
  filterObject(object, (_value, key) => keys.includes(key))

export default pickObjectKeys
