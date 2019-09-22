import SectionParser from '../SectionParser'
import { CodeSection, Instruction } from '../../../../casl/Instruction'
import MarsWalkCompiler from '../../MarsWalkCompiler'
import { Line } from '../../../Compiler'
import { ParserResult } from '../Parser'
import RegularParser from './RegularParser'
import FunctionDeclarationInstruction from '../../../../casl/actions/FunctionDeclarationInstruction'
import { matchTrimmed } from '../../../../../../utils/RegexUtils'

class FunctionParser extends SectionParser {
  isMainFunction: boolean
  functionName?: string
  functionDeclarationSection: CodeSection
  regularParser = new RegularParser(this.compilerInstance)

  constructor(compilerInstance: MarsWalkCompiler) {
    super(compilerInstance, /(programm)|(anweisung [a-zA-Z0-9_\-]{1,})/, /\*((programm)|(anweisung))/)
  }

  parseStartLine(line: Line) {
    this.functionDeclarationSection = line.trimmedSection
    if (
      line.line
        .toLowerCase()
        .trim()
        .startsWith('programm')
    ) {
      this.isMainFunction = true
      this.functionName = ''
    } else {
      const splitted = line.line.trim().split(' ')
      if (splitted.length !== 2) {
        this.errors.push({
          message: 'Unzulässige Syntax, um eine Anweisung zu deklarieren',
          section: line.section
        })
        return
      }
      this.functionName = splitted[1]
    }
  }

  static isFunction(line: string) {
    return matchTrimmed(line, /(programm)|(anweisung [a-zA-Z0-9_\-]{1,})/)
  }

  parseEndLine(line: Line) {
    /** Do nothing */
    return false
  }

  parseRegularLine(line: Line) {
    this.regularParser.parseLine(line)
  }

  getResult(): ParserResult {
    if (!this.ended) {
      this.errors.push({
        section: this.functionDeclarationSection,
        message: 'Die Funktion wurde nicht geschlossen',
        level: 'warning'
      })
    }
    const regularParserResult = this.regularParser.getResult()
    this.errors = this.errors.concat(regularParserResult.errors)
    if ((regularParserResult.results as Instruction[]).length === 0) {
      this.errors.push({
        section: this.functionDeclarationSection,
        message: 'Die Funktion ist leer',
        level: 'warning'
      })
    }
    return {
      errors: this.errors,
      results: new FunctionDeclarationInstruction(this.functionDeclarationSection, this.functionName, regularParserResult.results as Instruction[])
    }
  }
}

export default FunctionParser
