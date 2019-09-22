import curiosix from '../../../../../main'
import { NativeMethod } from '../NativeMethod'
import { Vector3 } from '../../../../../utils/Vector'
import Interpreter from '../../Interpreter'

class MoveForwardMethod extends NativeMethod {
  distance: number
  oneStepTime: number
  rotationVector: Vector3
  finalPosition: Vector3

  oneStepEstimatedProgress: number
  nextTarget: Vector3
  oldFinalPosition: Vector3
  nextFinalPosition: Vector3

  validateArguments(_arguments: any[]): string {
    if (_arguments.length !== 1) {
      return `Invalid amount of arguments (${_arguments.length} != 1)`
    }

    if (typeof _arguments[0] !== 'number') {
      return 'First argument "distance" isn\'t a number'
    }

    this.distance = _arguments[0] as number

    this.oneStepTime = 1 / this.distance
    this.oneStepEstimatedProgress = this.oneStepTime + 1
    this.nextFinalPosition = curiosix.world.rover.position.clone()
    this.rotationVector = curiosix.world.rover.getRotationAsVector()

    this.finalPosition = curiosix.world.rover.position.clone()
    this.finalPosition.add(this.rotationVector.clone().multiply(this.distance))
    this.finalPosition.y = curiosix.world.getHeightOfPosition(this.finalPosition)
    this.nextTarget = this.rotationVector.clone()
    return undefined
  }

  execute(progress: number, estiminatedProgress: number) {
    if (this.oneStepEstimatedProgress > this.oneStepTime) {
      curiosix.world.rover.position = this.nextFinalPosition.clone()
      this.findNextTarget()
      this.oneStepEstimatedProgress = 0
    }
    let stepProgress = (progress % this.oneStepTime) / this.oneStepTime
    const addVector = this.nextTarget.clone()
    addVector.x *= stepProgress
    if (addVector.y > 0) {
      addVector.y *= Math.min(stepProgress * 2, 1)
    } else {
      addVector.y *= Math.max(stepProgress * 2 - 1, 0)
    }
    addVector.z *= stepProgress
    curiosix.world.rover.position = this.oldFinalPosition.clone().add(addVector)
    this.oneStepEstimatedProgress += estiminatedProgress
  }

  findNextTarget() {
    this.oldFinalPosition = this.nextFinalPosition.clone()
    const newHeight = curiosix.world.getHeightOfPosition(curiosix.world.rover.position.clone().add(this.rotationVector))
    if (newHeight === Infinity) throw 'Curiosity wäre gegen eine Wand gefahren'
    const heightDifference = newHeight - curiosix.world.rover.position.y
    this.nextTarget.y = heightDifference
    this.nextFinalPosition.add(this.nextTarget)
    if (Math.abs(heightDifference) > 0.6) throw 'Curiosity kann nicht so hoch/tief springen'
  }

  finalise() {
    curiosix.world.rover.position = this.finalPosition
  }

  get executionTime() {
    return Interpreter.EXECUTION_TIME_PER_INSTRUCTION * this.distance
  }
}

export default MoveForwardMethod
