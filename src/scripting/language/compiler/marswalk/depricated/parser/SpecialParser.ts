import { CodeSection, Instruction } from '../../../../casl/Instruction'
import { Error } from '../../../Compiler'

export interface SpecialParser {
  parseLine(line: string, section: CodeSection): boolean
  getResult(): ParseResult
}

export class ParseResult {
  instruction: Instruction
  errors: Error[]
}
