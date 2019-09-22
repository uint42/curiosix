import { Instruction, InstructionType, CodeSection } from '../Instruction'

class FunctionDeclarationInstruction extends Instruction {
  type = InstructionType.FUNCTION_DECLARATION
  functionName: string
  instructions: Instruction[]

  constructor(section: CodeSection, functionName: string, instructions: Instruction[]) {
    super(section)
    this.functionName = functionName
    this.instructions = instructions
  }
}

export default FunctionDeclarationInstruction
