import Executor from '../Executor'
import FunctionInvocationInstruction from '../../casl/actions/FunctionInvocationInstruction'
import curiosix from '../../../../main'
import FunctionDeclarationInstruction from '../../casl/actions/FunctionDeclarationInstruction'

class FunctionInvocationExecutor extends Executor<FunctionInvocationInstruction> {
  functionToExecute: FunctionDeclarationInstruction

  init(): string {
    if (!curiosix.scriptingManager.interpreter.functions.has(this.instruction.functionName.toLowerCase())) {
      return `Can\'t find function "${this.instruction.functionName}"`
    }

    this.functionToExecute = curiosix.scriptingManager.interpreter.functions.get(this.instruction.functionName.toLowerCase())
  }

  execute(progress: number, estiminatedProgress: number) {}

  finalise() {
    this.functionToExecute.instructions
      .concat([])
      .reverse()
      .forEach(instruction => {
        curiosix.scriptingManager.interpreter.executionQueue.insert(instruction, this.instruction)
      })
  }
}

export default FunctionInvocationExecutor
