class Condition<T> {
  variable: string
  expectedValue: T
  invert: boolean

  constructor(variable: string, expectedValue: T, invert: boolean) {
    this.variable = variable
    this.expectedValue = expectedValue
    this.invert = invert
  }

  isFullfilled(value: T): boolean {
    if (this.invert) {
      return this.expectedValue !== value
    } else {
      return this.expectedValue === value
    }
    return this.invert ? this.expectedValue !== value : this.expectedValue === value
  }
}

export default Condition
