import SectionParser from '../SectionParser'
import MarsWalkCompiler from '../../MarsWalkCompiler'
import { Line } from '../../../Compiler'
import Condition from '../../../../casl/utils/Condition'
import { CodeSection, Instruction } from '../../../../casl/Instruction'
import { parseCondition } from '../utils/Conditions'
import { matchTrimmed } from '../../../../../../utils/RegexUtils'
import RegularParser from './RegularParser'
import { ParserResult } from '../Parser'
import WhileLoopInstruction from '../../../../casl/actions/WhileLoopInstruction'

class WhileParser extends SectionParser {
  declarationSection: CodeSection
  conditionFieldNameSection: CodeSection
  condition: Condition<any>

  regularParser: RegularParser

  constructor(compilerInstance: MarsWalkCompiler) {
    super(compilerInstance, /solange [a-z]{1,} tue/, /\*solange/)
    this.regularParser = new RegularParser(compilerInstance)
  }

  parseStartLine(line: Line) {
    //TODO: remove "solange" and "tue"
    this.declarationSection = line.trimmedSection
    this.conditionFieldNameSection = line.trimmedSection

    const splitted = line.line
      .trim()
      .toLowerCase()
      .split(' ')
    if (splitted.length !== 3) {
      this.errors.push({
        message: 'Internal error, please open an issue on gitlab',
        section: line.trimmedSection
      })
    }
    try {
      const condition = parseCondition(splitted[1])
      this.condition = condition
    } catch (e) {
      this.errors.push({
        message: 'Unbekannte Bedingung',
        section: this.conditionFieldNameSection
      })
    }
  }

  static isWhileLoop(rawLine: string) {
    return matchTrimmed(rawLine, /solange [a-z]{1,} tue/)
  }

  parseEndLine(line: Line) {
    if (this.regularParser.currentParser !== undefined && this.regularParser.currentParser instanceof WhileParser) {
      console.log(line.line, 'not the really end')
      this.regularParser.parseLine(line)
      return true
    }
    return false
  }

  parseRegularLine(line: Line) {
    this.regularParser.parseLine(line)
  }

  getResult(): ParserResult {
    if (!this.ended) {
      this.errors.push({
        section: this.declarationSection,
        message: 'Die solange-Anweisung wurde nicht geschlossen',
        level: 'warning'
      })
    }
    const result = this.regularParser.getResult()
    this.errors = this.errors.concat(result.errors)

    if ((result.results as Instruction[]).length === 0) {
      this.errors.push({
        section: this.declarationSection,
        message: 'Die solange-Anweisung ist leer',
        level: 'warning'
      })
    }

    return {
      errors: this.errors,
      results: new WhileLoopInstruction(this.declarationSection, this.condition, result.results as Instruction[])
    }
  }
}

export default WhileParser
