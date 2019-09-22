import { Instruction, InstructionType, CodeSection } from '../Instruction'

class FunctionInvocationInstruction extends Instruction {
  type = InstructionType.FUNCTION_INVOCATION
  functionName: string

  constructor(section: CodeSection, functionName: string) {
    super(section)
    this.functionName = functionName
  }
}

export default FunctionInvocationInstruction
