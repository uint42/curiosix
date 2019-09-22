import { CodeSection } from '../../../../casl/Instruction'
import { SpecialParser, ParseResult } from './SpecialParser'
import { LineOld, RegularParser } from './RegularParser'
import { Error } from '../../../Compiler'
import FunctionDeclarationInstruction from '../../../../casl/actions/FunctionDeclarationInstruction'

class FunctionParser implements SpecialParser {
  firstLine: boolean = true

  functionName: string
  isMainFunction: boolean
  functionDeclarationSection: CodeSection

  regularLines: LineOld[] = []
  errors: Error[] = []

  parseLine(line: string, section: CodeSection): boolean {
    if (this.firstLine) {
      if (line === 'Programm') {
        this.functionName = 'main'
        this.isMainFunction = true
      } else if (line.startsWith('Anweisung')) {
        const splitted = line.split(' ')
        this.isMainFunction = false
        if (splitted.length !== 2) {
          this.errors.push({
            message: 'Unzulässige Syntax',
            section: section
          })
        } else {
          this.functionName = splitted[1]
        }
      }
      this.functionDeclarationSection = section
      this.firstLine = false
      return false
    } else if (line === '*Anweisung' || line === '*Programm') {
      return true
    } else {
      this.regularLines.push({
        lineText: line,
        section
      })
      return false
    }
  }

  static newFunctionParser(line: string): boolean {
    return line.match(/Programm|Anweisung/) !== null
  }

  getResult(): ParseResult {
    const regularParser = new RegularParser(this.regularLines)
    regularParser.parse()
    return {
      instruction: new FunctionDeclarationInstruction(this.functionDeclarationSection, this.functionName, regularParser.instructions),
      errors: this.errors.concat(regularParser.errors)
    }
  }
}

export default FunctionParser
