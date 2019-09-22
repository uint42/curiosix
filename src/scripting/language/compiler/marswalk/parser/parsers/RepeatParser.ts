import SectionParser from '../SectionParser'
import { Line } from '../../../Compiler'
import { ParserResult } from '../Parser'
import MarsWalkCompiler from '../../MarsWalkCompiler'

class RepeatParser extends SectionParser {
  constructor(compilerInstance: MarsWalkCompiler) {
    super(compilerInstance, /wiederhole( \S{1,})*/, /\*wiederhole( \S{1,})*/)
  }

  parseStartLine(line: Line) {
    throw new Error('Method not implemented.')
  }

  parseEndLine(line: Line): boolean {
    throw new Error('Method not implemented.')
  }

  parseRegularLine(line: Line) {
    throw new Error('Method not implemented.')
  }

  getResult(): ParserResult {
    throw new Error('Method not implemented.')
  }
}
