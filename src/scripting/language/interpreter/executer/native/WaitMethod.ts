import { NativeMethod } from '../NativeMethod'
import { Mesh, CircleGeometry, Math as ThreeMath, MeshBasicMaterial, DoubleSide, Material, RingGeometry } from 'three'
import curiosix from '../../../../../main'

class WaitMethod extends NativeMethod {
  time: number
  circle: Mesh

  validateArguments(_arguments: any[]): string {
    if (_arguments.length !== 1) {
      return `Invalid amount of arguments (${_arguments.length} != 1)`
    }

    if (typeof _arguments[0] !== 'number') {
      return 'First argument "time" isn\'t a number'
    }
    this.time = _arguments[0] as number

    const circleStartGeometry = new RingGeometry(0.35, 0.5, 64, 1, 0, ThreeMath.degToRad(360))
    const circleMaterial = new MeshBasicMaterial({
      side: DoubleSide,
      color: 0xffffff,
      transparent: true,
      opacity: 0.7
    })
    this.circle = new Mesh(circleStartGeometry, circleMaterial)
    this.circle.rotateX(ThreeMath.degToRad(90))
    this.circle.rotateZ(ThreeMath.degToRad(curiosix.world.rover.rotation + 90))
    this.circle.position.set(-curiosix.world.rover.position.x + 0.5, curiosix.world.rover.position.y, -curiosix.world.rover.position.z + 0.5)

    curiosix.world.addTemporyObject(this.circle)
  }

  execute(progress: number, estiminatedProgress: number) {
    this.circle.geometry.dispose()
    this.circle.geometry = new RingGeometry(0.35, 0.5, 64, 1, ThreeMath.degToRad(360 * Math.pow(progress, 2)), ThreeMath.degToRad(360 * (1 - Math.pow(progress, 2))))
    if (progress > 0.7) {
      ;(this.circle.material as Material).opacity = (1 - (progress - 0.7) / 0.3) * 0.7
    }
  }

  finalise() {
    curiosix.world.removeTemporyObject(this.circle)
  }

  get executionTime() {
    return this.time
  }
}

export default WaitMethod
