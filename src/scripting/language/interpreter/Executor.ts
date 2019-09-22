import { Instruction } from '../casl/Instruction'
import Interpreter from './Interpreter'

abstract class Executor<T extends Instruction> {
  instruction: T

  constructor(instruction: T) {
    this.instruction = instruction
  }

  abstract init(): string

  abstract execute(progress: number, estiminatedProgress: number)

  abstract finalise()

  get executionTime() {
    return Interpreter.EXECUTION_TIME_PER_INSTRUCTION
  }
}

export default Executor
