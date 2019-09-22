import { NativeMethod } from '../NativeMethod'
import curiosix from '../../../../../main'
import { Queue } from 'queue-typescript'

class StopMethod extends NativeMethod {
  validateArguments(_arguments: any[]): string {
    return undefined
  }

  execute(progress: number, estiminatedProgress: number) {}

  finalise() {
    curiosix.scriptingManager.interpreter.executionQueue = new Queue()
  }

  get executionTime() {
    return 0
  }
}

export default StopMethod
