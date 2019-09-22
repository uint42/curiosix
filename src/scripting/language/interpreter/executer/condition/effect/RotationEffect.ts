import CheckEffect from '../CheckEffect'
import { Vector2, Shape, MeshBasicMaterial, Mesh, Material, ExtrudeBufferGeometry, Math as ThreeMath } from 'three'
import curiosix from '../../../../../../main'

class RotationEffect extends CheckEffect {
  rotation: number

  constructor(rotation: number) {
    super()
    this.rotation = rotation
    this.build()
  }

  build() {
    const shape = new Shape([new Vector2(-1, 0), new Vector2(0, 1), new Vector2(0, -1), new Vector2(-1, 0)])
    const geometry = new ExtrudeBufferGeometry(shape, {
      bevelEnabled: false,
      depth: 0.1
    })
    const material = new MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      depthTest: false
    })
    this.mesh = new Mesh(geometry, material)
    this.mesh.scale.setScalar(0.25)
    this.mesh.rotateX(ThreeMath.degToRad(90))
    this.mesh.rotateZ(ThreeMath.degToRad(this.rotation - 90))

    const position = curiosix.world.rover.position.clone().add(curiosix.world.rover.getRotationAsVector(this.rotation).multiply(0.6))
    this.mesh.position.set(-position.x + 0.5, curiosix.world.rover.position.y + 0.1, -position.z + 0.5)
  }

  update(progress: number) {
    //p = 1 - |(2x - 1)²|
    const p = 1 - Math.abs(Math.pow(2 * progress - 1, 2))
    this.mesh.scale.setScalar(0.25 + p * 0.1)
    ;(this.mesh.material as Material).opacity = p * 0.7
  }
}

export default RotationEffect
