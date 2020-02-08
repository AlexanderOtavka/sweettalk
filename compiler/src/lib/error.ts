import { locationToString } from "./location"

export const locatedError = (message: string, location: any) => ({
  type: "located error",
  message,
  location,
})

export const locatedErrorToString = (error: any, sourceCode: string) =>
  `Error: ${error.message} at ${locationToString(error.location, sourceCode)}`
