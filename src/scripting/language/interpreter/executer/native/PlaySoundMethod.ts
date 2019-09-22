import { NativeMethod } from '../NativeMethod'
import { Mesh, DoubleSide, MeshBasicMaterial, Material, SphereBufferGeometry, Math as ThreeMath } from 'three'
import curiosix from '../../../../../main'

class PlaySoundMethod extends NativeMethod {
  static audio = new Audio(require('../../../../../../assets/sounds/confident.mp3'))
  circle: Mesh
  circleMaterial: Material

  validateArguments(_arguments: any[]): string {
    PlaySoundMethod.audio.currentTime = 0
    const circleMaterial = new MeshBasicMaterial({
      color: 0xffffffff,
      transparent: true,
      opacity: 0.6,
      side: DoubleSide,
      depthWrite: false,
      depthTest: false
    })
    const circleGeometry = new SphereBufferGeometry(0.5, 64, 64)
    this.circle = new Mesh(circleGeometry, circleMaterial)
    this.circle.position.set(-curiosix.world.rover.position.x + 0.5, curiosix.world.rover.position.y + 0.35, -curiosix.world.rover.position.z + 0.5)
    this.circle.rotateX(ThreeMath.degToRad(90))
    curiosix.world.addTemporyObject(this.circle)
    return undefined
  }

  execute(progress: number, estiminatedProgress: number) {
    if (PlaySoundMethod.audio.paused) {
      PlaySoundMethod.audio.play()
    }
    ;(this.circle.material as Material).opacity = Math.pow(1 - progress, 3) * 0.6
    this.circle.scale.setScalar(1 + progress / 2)
  }

  finalise() {
    curiosix.world.removeTemporyObject(this.circle)
  }
}

export default PlaySoundMethod
