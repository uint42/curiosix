import FunctionDeclarationInstruction from './actions/FunctionDeclarationInstruction'

class CASLProgram {
  version: number

  originalCode: string
  functions: FunctionDeclarationInstruction[]
  mainFunction: number
  constructor(originalCode: string, functions: FunctionDeclarationInstruction[], mainFunction: number, version: number = 1) {
    this.version = version
    this.originalCode = originalCode
    this.functions = functions
    this.mainFunction = mainFunction
    if (mainFunction >= functions.length) throw new Error('Invalid main function')
  }
}

export default CASLProgram
