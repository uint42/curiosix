import MarsWalkCompiler from '../MarsWalkCompiler'
import { Line, Error } from '../../Compiler'
import { Instruction } from '../../../casl/Instruction'

export abstract class Parser {
  compilerInstance: MarsWalkCompiler
  errors: Error[] = []

  constructor(compilerInstance) {
    this.compilerInstance = compilerInstance
  }

  abstract parseLine(line: Line): boolean
  abstract getResult(): ParserResult
}

export type ParserResult = {
  errors: Error[]
  results: Instruction | Instruction[]
}
