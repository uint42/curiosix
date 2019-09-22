import { Compiler, Error, Line, CompilerResult } from '../Compiler'
import CASLProgram from '../../casl/CASLProgram'
import FunctionParser from './parser/parsers/FunctionParser'
import { CodeSection } from '../../casl/Instruction'
import FunctionDeclarationInstruction from '../../casl/actions/FunctionDeclarationInstruction'

class MarsWalkCompiler extends Compiler {
  errors: Error[] = []

  functionParsers: FunctionParser[] = []

  functionNames: string[] = []
  mainFunction: number

  compile(code: string): CompilerResult {
    console.group('MarsWalk Compiler')
    this.parseFunctions(code)
    this.parseFunctionNames()
    const functions = this.buildProgramm()
    console.groupEnd()
    return {
      errors: this.errors,
      program: new CASLProgram(code, functions, this.mainFunction),
      executable: this.errors.filter(error => error.level !== 'warning').length === 0
    }
  }

  private parseFunctions(code: string) {
    let currentLine = 0
    let currentFunctionParser: FunctionParser

    code.split('\n').forEach(rawLine => {
      console.log('[Parser] Parsing new line')

      currentLine++

      if (rawLine.trim() === '') return

      const line: Line = {
        line: rawLine,
        trimmedLine: rawLine.trim().toLowerCase(),
        section: {
          start: {
            line: currentLine,
            character: 0
          },
          end: {
            line: currentLine,
            character: rawLine.length
          }
        },
        trimmedSection: this.getTrimmedSection(rawLine, currentLine)
      }

      if (currentFunctionParser !== undefined) {
        if (!currentFunctionParser.parseLine(line)) {
          currentFunctionParser = undefined
        }
      } else {
        if (FunctionParser.isFunction(rawLine)) {
          currentFunctionParser = new FunctionParser(this)
          this.functionParsers.push(currentFunctionParser)
          currentFunctionParser.parseLine(line)
        } else {
          this.errors.push({
            message: 'Anweisungen müssen in einer Funktion stehen',
            section: line.trimmedSection
          })
        }
      }
    })
  }

  private parseFunctionNames() {
    //check for multiple main functions
    console.log('[Parser] Looking for more than one main function')
    const mainFunctions = []
    for (let i = 0; i < this.functionParsers.length; i++) {
      if (this.functionParsers[i].isMainFunction) mainFunctions.push(i)
    }
    if (mainFunctions.length === 1) {
      this.mainFunction = mainFunctions[0]
    } else {
      mainFunctions.forEach(mainFunctionIndex => {
        this.errors.push({
          message: 'Es darf nur ein Programm/eine Hauptanweisung geben',
          section: this.functionParsers[mainFunctionIndex].functionDeclarationSection
        })
      })
      this.mainFunction = -1
    }

    console.log('[Parser] Looking for dublicated function names')
    const functionNameMap = new Map<string, FunctionParser[]>()
    this.functionParsers.forEach(functionParser => {
      if (functionParser.isMainFunction) return

      if (!functionNameMap.has(functionParser.functionName.toLowerCase())) {
        functionNameMap.set(functionParser.functionName.toLowerCase(), [functionParser])
      } else {
        functionNameMap.get(functionParser.functionName.toLowerCase()).push(functionParser)
      }
    })

    functionNameMap.forEach((functionParsers, functionName) => {
      if (functionParsers.length === 1) {
        this.functionNames.push(functionName)
      } else {
        functionParsers.forEach(functionParser => {
          this.errors.push({
            message: 'Es darf keine ' + functionParsers.length + ' Anweisungen mit dem gleichen Namen geben.',
            section: functionParser.functionDeclarationSection
          })
        })
      }
    })
  }

  private buildProgramm(): FunctionDeclarationInstruction[] {
    const functions: FunctionDeclarationInstruction[] = []
    this.functionParsers.forEach(functionParser => {
      const result = functionParser.getResult()
      this.errors = this.errors.concat(result.errors)
      functions.push(result.results as FunctionDeclarationInstruction)
    })
    return functions
  }

  private getTrimmedSection(rawLine: string, lineNumber: number): CodeSection {
    const splitted = rawLine.split('')

    let startTrimm = 0
    for (let i = 0; i < splitted.length; i++) {
      if (splitted[i] === ' ') {
        startTrimm++
      } else {
        break
      }
    }

    let endTrimm = splitted.length
    for (let i = splitted.length - 1; i > 0; i--) {
      if (splitted[i] === ' ') {
        endTrimm--
      } else {
        break
      }
    }

    return {
      start: {
        line: lineNumber,
        character: startTrimm
      },
      end: {
        line: lineNumber,
        character: endTrimm
      }
    }
  }
}

export default MarsWalkCompiler
