import test from "ava"
import loadFeatures from "./loadFeatures"

const requireFeature = (fileName: string) => {
  if (fileName === "/features/foo") {
    return { a: 1, b: 2 }
  } else if (fileName === "/features/bar") {
    return { a: 3, b: 4 }
  } else {
    throw Error(`Bad filename: ${fileName}`)
  }
}

test("loadFeatures collects everything from the directory", t => {
  t.deepEqual(
    loadFeatures("/features", {
      readdirSync: () => ["foo.js", "bar.js"],
      require: requireFeature,
    }),
    {
      a: [1, 3],
      b: [2, 4],
    },
  )
})

test("loadFeatures ignores .spec files", t => {
  t.deepEqual(
    loadFeatures("/features", {
      readdirSync: () => ["bar.js", "bar.spec.js"],
      require: requireFeature,
    }),
    {
      a: [3],
      b: [4],
    },
  )
})

test("loadFeatures ignores .d.ts files", t => {
  t.deepEqual(
    loadFeatures("/features", {
      readdirSync: () => ["bar.js", "bar.d.ts"],
      require: requireFeature,
    }),
    {
      a: [3],
      b: [4],
    },
  )
})
