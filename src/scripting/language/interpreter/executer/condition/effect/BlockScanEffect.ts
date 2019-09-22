import { Vector2 } from '../../../../../../utils/Vector'
import { MeshBasicMaterial, DoubleSide, PlaneGeometry, Mesh, Math as ThreeMath, Material, PlaneBufferGeometry } from 'three'
import CheckEffect from '../CheckEffect'
import curiosix from '../../../../../../main'

class BlockScanEffect extends CheckEffect {
  position: Vector2

  constructor(position: Vector2) {
    super()
    this.position = position
    this.build()
  }

  build() {
    const material = new MeshBasicMaterial({
      transparent: true,
      color: 0x66f966,
      side: DoubleSide,
      opacity: 0.7,
      depthTest: false,
      depthWrite: false
    })
    const geometry = new PlaneBufferGeometry(1.1, 1.1, 1, 1)
    this.mesh = new Mesh(geometry, material)
    this.mesh.rotateX(ThreeMath.degToRad(90))
    this.mesh.position.set(-this.position.x + 0.5, 1, -this.position.z + 0.5)
  }

  update(progress: number) {
    const p = (1 - progress) * (1 - progress)
    this.mesh.position.y = Math.max(curiosix.world.getHeightOfPosition(this.position), 1) * p
    ;(this.mesh.material as Material).opacity = p * 0.7
  }
}

export default BlockScanEffect
