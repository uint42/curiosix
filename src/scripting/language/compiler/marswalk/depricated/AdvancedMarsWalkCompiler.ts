import { Compiler, Error, CompilerResult } from '../../Compiler'
import CASLProgram from '../../../casl/CASLProgram'
import FunctionParser from './parser/FunctionParser'
import { CodeSection } from '../../../casl/Instruction'
import FunctionDeclarationInstruction from '../../../casl/actions/FunctionDeclarationInstruction'

class AdvancedWarsWalkCompiler extends Compiler {
  currentFunctionParser: FunctionParser = undefined
  functionParsers: FunctionParser[] = []
  functionNames: string[]
  errors: Error[] = []

  compile(code: string): CompilerResult {
    let currentLineNumber = 1
    code.split('\n').forEach(line => {
      if (line !== '') this.parseLine(line, currentLineNumber)
      currentLineNumber++
    })

    const declarations = []
    let index = 0
    let mainFunctionIndex = 0
    this.functionParsers.forEach(functionParser => {
      if (functionParser.isMainFunction) {
        mainFunctionIndex = index
      }
      const result = functionParser.getResult()
      declarations.push(result.instruction)
      this.errors = this.errors.concat(result.errors)
      index++
    })
    return {
      errors: this.errors,
      program: new CASLProgram(code, declarations, mainFunctionIndex),
      executable: this.errors.length === 1
    }
  }

  private checkForInvalidFunctions() {
    //check for multiple main functions
    const mainFunctions: FunctionParser[] = this.functionParsers.filter(functionParser => functionParser.isMainFunction)
    if (mainFunctions.length !== 1) {
      this.errors.concat(mainFunctions.map((mainFunction: FunctionParser) => {
        return {
          section: mainFunction.functionDeclarationSection,
          message: 'Es darf nur eine Hauptanweisung geben'
        }
      }) as Error[])
    }

    //check for functions with same name
    const functionNameMap = new Map<string, FunctionDeclarationInstruction[]>()
    this.functionParsers.forEach(functionParser => {
      if (functionNameMap.has(functionParser.functionName)) {
        functionNameMap[functionParser.functionName].push(functionParser)
      } else {
        functionNameMap[functionParser.functionName] = [functionParser]
      }
    })

    this.functionNames = []
    functionNameMap.forEach((functionDeclarations, name) => {
      if (functionDeclarations.length === 1) {
        this.functionNames.push(name)
      }
    })
  }

  private parseLine(line: string, lineNumber: number) {
    const codeSection: CodeSection = {
      start: {
        line: lineNumber,
        character: 0
      },
      end: {
        line: lineNumber,
        character: line.length
      }
    }

    if (this.currentFunctionParser !== undefined) {
      if (this.currentFunctionParser.parseLine(line, codeSection)) {
        this.currentFunctionParser = undefined
      }
    } else {
      if (FunctionParser.newFunctionParser(line)) {
        this.currentFunctionParser = new FunctionParser()
        this.currentFunctionParser.parseLine(line, codeSection)
        this.functionParsers.push(this.currentFunctionParser)
      } else {
        this.errors.push({
          message: 'Anweisungen müssen in einer Anweisung stehen',
          section: codeSection
        })
      }
    }
  }
}

export default AdvancedWarsWalkCompiler
