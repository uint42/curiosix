import Interpreter from '../Interpreter'

export abstract class NativeMethod {
  abstract validateArguments(_arguments: any[]): string

  abstract execute(progress: number, estiminatedProgress: number)

  abstract finalise()

  get executionTime() {
    return Interpreter.EXECUTION_TIME_PER_INSTRUCTION
  }
}
