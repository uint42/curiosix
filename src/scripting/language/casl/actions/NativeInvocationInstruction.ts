import { Instruction, InstructionType, CodeSection } from '../Instruction'

class NativeInvocationInstruction extends Instruction {
  type = InstructionType.NATIVE_INVOCATION
  nativeMethodName: string
  arguments: any[]

  constructor(section: CodeSection, nativeMethodName: string, _arguments: any[]) {
    super(section)
    this.nativeMethodName = nativeMethodName
    this.arguments = _arguments
  }
}

export default NativeInvocationInstruction
