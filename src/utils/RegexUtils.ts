export function match(text: string, regex: RegExp): boolean {
  const result = text.match(regex)
  if (result === null) return false
  return result[0] === result.input
}

export function matchTrimmed(text: string, regex: RegExp): boolean {
  return match(text.trim().toLowerCase(), regex)
}
