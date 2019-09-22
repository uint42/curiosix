import { Instruction, InstructionType, CodeSection } from '../Instruction'
import Condition from '../utils/Condition'

class WhileLoopInstruction<T> extends Instruction {
  type = InstructionType.WHILE_LOOP
  condition: Condition<T>
  instructions: Instruction[]

  constructor(section: CodeSection, condition: Condition<T>, instructions: Instruction[]) {
    super(section)
    this.condition = condition
    this.instructions = instructions
  }
}

export default WhileLoopInstruction
