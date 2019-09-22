import { Instruction, InstructionType, CodeSection } from '../Instruction'
import Condition from '../utils/Condition'

class ConditionalStatementInstruction<T> extends Instruction {
  type = InstructionType.CONDITIONAL_STATEMENT
  condition: Condition<T>

  fullfilled: Instruction[]
  notFullfilled: Instruction[]

  constructor(section: CodeSection, condition: Condition<T>, fullfilled: Instruction[] = [], notFullfilled: Instruction[] = []) {
    super(section)
    this.condition = condition
    this.fullfilled = fullfilled
    this.notFullfilled = notFullfilled
  }
}

export default ConditionalStatementInstruction
