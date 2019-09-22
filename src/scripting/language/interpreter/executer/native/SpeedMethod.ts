import { NativeMethod } from '../NativeMethod'
import Interpreter from '../../Interpreter'

class SpeedMethod extends NativeMethod {
  newSpeed: number
  first = true

  validateArguments(_arguments: any[]): string {
    if (_arguments.length !== 1) {
      return `Invalid amount of arguments (${_arguments.length} != 1)`
    }

    if (typeof _arguments[0] !== 'number') {
      return 'First argument "speed" isn\'t a number'
    }
    this.newSpeed = _arguments[0] as number
  }

  execute(progress: number, estiminatedProgress: number) {
    if (this.first) {
      Interpreter.updateExecutionTime(this.newSpeed)
      this.first = false
    }
  }

  finalise() {}
}

export default SpeedMethod
