import curiosix from '../../../../../main'
import { NativeMethod } from '../NativeMethod'

class RotateMethod extends NativeMethod {
  rotation: number
  finalRotation: number

  validateArguments(_arguments: any[]): string {
    if (_arguments.length !== 1) {
      return `Invalid amount of arguments (${_arguments.length} != 1)`
    }

    if (typeof _arguments[0] !== 'number') {
      return 'First argument "rotation" isn\'t a number'
    }

    this.rotation = _arguments[0] as number
    this.finalRotation = curiosix.world.rover.rotation + this.rotation
    return undefined
  }

  execute(progress: number, estiminatedProgress: number) {
    curiosix.world.rover.rotation += this.rotation * estiminatedProgress
  }

  finalise() {
    curiosix.world.rover.rotation = this.finalRotation
  }
}

export default RotateMethod
