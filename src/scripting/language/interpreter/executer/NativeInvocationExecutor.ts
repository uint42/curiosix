import NativeInvocationInstruction from '../../casl/actions/NativeInvocationInstruction'
import Executor from '../Executor'
import { NativeMethod } from './NativeMethod'

import MoveForwardMethod from './native/MoveForwardMethod'
import RotateMethod from './native/RotateMethod'
import PlaySoundMethod from './native/PlaySoundMethod'
import StopMethod from './native/StopMethod'
import SpeedMethod from './native/SpeedMethod'
import WaitMethod from './native/WaitMethod'
import MarkerMethod from './native/MarkerMethod'
import BrickMethod from './native/BrickMethod'

export class NativeInvocationExecutor extends Executor<NativeInvocationInstruction> {
  method: NativeMethod

  init() {
    this.method = findMethod(this.instruction.nativeMethodName)
    if (this.method === undefined) {
      return 'Unknown native method'
    }
    return this.method.validateArguments(this.instruction.arguments)
  }

  execute(progress: number, estiminatedProgress: number) {
    this.method.execute(progress, estiminatedProgress)
  }

  finalise() {
    this.method.finalise()
  }

  get executionTime() {
    return this.method.executionTime
  }
}

function findMethod(methodName: string) {
  switch (methodName) {
    case 'moveForward': {
      return new MoveForwardMethod()
    }
    case 'rotate': {
      return new RotateMethod()
    }
    case 'playSound': {
      return new PlaySoundMethod()
    }
    case 'stop': {
      return new StopMethod()
    }
    case 'speed': {
      return new SpeedMethod()
    }
    case 'wait': {
      return new WaitMethod()
    }
    case 'marker': {
      return new MarkerMethod()
    }
    case 'brick': {
      return new BrickMethod()
    }
    default: {
      return undefined
    }
  }
}
