import Executor from '../Executor'
import WhileLoopInstruction from '../../casl/actions/WhileLoopInstruction'
import ConditionChecker from './condition/ConditionChecker'
import curiosix from '../../../../main'
import ConditionalStatementInstruction from '../../casl/actions/ConditionalStatementInstruction'

class ConditionalStatementExecutor extends Executor<ConditionalStatementInstruction<any>> {
  conditionChecker: ConditionChecker

  init(): string {
    this.conditionChecker = new ConditionChecker(this.instruction.condition)
    try {
      this.conditionChecker.parseCondition()
    } catch (e) {
      console.error(e)
      return e.toString()
    }
    this.conditionChecker.scanEffect.addToScene()
    return undefined
  }

  execute(progress: number, estiminatedProgress: number) {
    this.conditionChecker.scanEffect.update(progress)
  }

  finalise() {
    if (this.conditionChecker.fullfilled) {
      this.instruction.fullfilled
        .concat([])
        .reverse()
        .forEach(instruction => {
          curiosix.scriptingManager.interpreter.executionQueue.insert(instruction, this.instruction)
        })
    } else {
      this.instruction.notFullfilled
        .concat([])
        .reverse()
        .forEach(instruction => {
          curiosix.scriptingManager.interpreter.executionQueue.insert(instruction, this.instruction)
        })
    }
    this.conditionChecker.scanEffect.removeFromScene()
  }
}

export default ConditionalStatementExecutor
