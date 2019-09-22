import { Parser } from './Parser'
import MarsWalkCompiler from '../MarsWalkCompiler'
import { Line } from '../../Compiler'
import { matchTrimmed } from '../../../../../utils/RegexUtils'

abstract class SectionParser extends Parser {
  private startRegExp: RegExp
  private endRegExp: RegExp
  private alreadyStarted: boolean = false
  protected ended: boolean = false

  constructor(compilerInstance: MarsWalkCompiler, startRegExp: RegExp, endRegExp: RegExp) {
    super(compilerInstance)
    this.startRegExp = startRegExp
    this.endRegExp = endRegExp
  }

  abstract parseStartLine(line: Line)
  abstract parseEndLine(line: Line): boolean
  abstract parseRegularLine(line: Line)

  parseLine(line: Line): boolean {
    if (matchTrimmed(line.line, this.startRegExp) && !this.alreadyStarted) {
      console.log('[Parser] Line indicates a start of a section')
      this.parseStartLine(line)
      this.alreadyStarted = true
      return true
    }

    if (matchTrimmed(line.line, this.endRegExp)) {
      console.log('[Parser] Line indicates an end of a section')
      if (this.parseEndLine(line)) {
        return true
      } else {
        this.ended = true
        return false
      }
    }

    console.log('[Parser] Line should be a regular line')
    this.parseRegularLine(line)
    return true
  }
}

export default SectionParser
