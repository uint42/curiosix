import Executor from '../Executor'
import WhileLoopInstruction from '../../casl/actions/WhileLoopInstruction'
import ConditionChecker from './condition/ConditionChecker'
import curiosix from '../../../../main'

class WhileLoopExectutor extends Executor<WhileLoopInstruction<any>> {
  conditionChecker: ConditionChecker
  isFinished = false

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
      curiosix.scriptingManager.interpreter.executionQueue.insert(this.instruction, this.instruction)
      this.instruction.instructions
        .concat([])
        .reverse()
        .forEach(instruction => {
          curiosix.scriptingManager.interpreter.executionQueue.insert(instruction, this.instruction)
        })
    }
    this.conditionChecker.scanEffect.removeFromScene()
  }
}

export default WhileLoopExectutor
