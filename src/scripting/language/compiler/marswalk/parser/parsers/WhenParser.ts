import SectionParser from '../SectionParser'
import { ParserResult } from '../Parser'
import { Line } from '../../../Compiler'
import MarsWalkCompiler from '../../MarsWalkCompiler'
import RegularParser from './RegularParser'
import { CodeSection, Instruction } from '../../../../casl/Instruction'
import { parseCondition } from '../utils/Conditions'
import Condition from '../../../../casl/utils/Condition'
import ConditionalStatementInstruction from '../../../../casl/actions/ConditionalStatementInstruction'
import { matchTrimmed } from '../../../../../../utils/RegexUtils'

class WhenParser extends SectionParser {
  currentType = SectionType.UNDEFINED
  declarationSection: CodeSection
  fullfilledParser: RegularParser = new RegularParser(this.compilerInstance)
  notFullfilledParser: RegularParser = new RegularParser(this.compilerInstance)
  condition: Condition<any>
  conditionFieldNameSection: CodeSection

  constructor(compilerInstance: MarsWalkCompiler) {
    super(compilerInstance, /wenn [a-z]{1,}( dann)?/, /\*wenn/)
  }

  parseStartLine(line: Line) {
    this.declarationSection = line.trimmedSection
    const splitted = line.line
      .trim()
      .toLowerCase()
      .split(' ')

    if (splitted.length < 2) {
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

    if (
      line.line
        .trim()
        .toLowerCase()
        .endsWith('dann')
    ) {
      this.currentType = SectionType.FULLFILLED
    }
  }

  parseEndLine(line: Line) {
    if (this.currentType === SectionType.FULLFILLED && this.fullfilledParser.currentParser && this.fullfilledParser.currentParser instanceof WhenParser) {
      this.fullfilledParser.parseLine(line)
      return true
    } else if (this.currentType === SectionType.NOT_FULLFILLED && this.notFullfilledParser.currentParser && this.notFullfilledParser.currentParser instanceof WhenParser) {
      this.fullfilledParser.parseLine(line)
      return true
    }
    return false
  }

  static isWhen(rawLine: string) {
    return matchTrimmed(rawLine, /wenn [a-z]{1,}( dann)?/)
  }

  parseRegularLine(line: Line) {
    if (
      !(
        (this.fullfilledParser.currentParser && this.fullfilledParser.currentParser instanceof WhenParser) ||
        (this.notFullfilledParser.currentParser && this.notFullfilledParser.currentParser instanceof WhenParser)
      )
    ) {
      if (line.trimmedLine == 'dann') {
        this.currentType = SectionType.FULLFILLED
        return
      } else if (line.trimmedLine == 'sonst') {
        this.currentType = SectionType.NOT_FULLFILLED
        return
      }
    }
    switch (this.currentType) {
      case SectionType.UNDEFINED: {
        this.errors.push({
          message: 'Bedingte Anweisungen müssen in einer dann oder sonst Anweisung stehen',
          section: line.trimmedSection
        })
        break
      }
      case SectionType.FULLFILLED: {
        this.fullfilledParser.parseLine(line)
        break
      }
      case SectionType.NOT_FULLFILLED: {
        this.notFullfilledParser.parseLine(line)
        break
      }
    }
  }

  getResult(): ParserResult {
    if (!this.ended) {
      this.errors.push({
        section: this.declarationSection,
        message: 'Die wenn-Anweisung wurde nicht geschlossen',
        level: 'warning'
      })
    }
    const fullfilledResult = this.fullfilledParser.getResult()
    const notFullfilledResult = this.notFullfilledParser.getResult()

    this.errors = this.errors.concat(fullfilledResult.errors, notFullfilledResult.errors)
    return {
      errors: this.errors,
      results: new ConditionalStatementInstruction(this.declarationSection, this.condition, fullfilledResult.results as Instruction[], notFullfilledResult.results as Instruction[])
    }
  }
}

enum SectionType {
  FULLFILLED,
  NOT_FULLFILLED,
  UNDEFINED
}

export default WhenParser
