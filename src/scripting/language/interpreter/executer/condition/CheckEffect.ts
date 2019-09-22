import { Vector2 } from '../../../../../utils/Vector'
import { Mesh } from 'three'
import curiosix from '../../../../../main'

abstract class CheckEffect {
  mesh: Mesh

  abstract build()
  abstract update(progress: number)

  addToScene() {
    curiosix.world.addTemporyObject(this.mesh)
  }

  removeFromScene() {
    curiosix.world.removeTemporyObject(this.mesh)
  }
}

export default CheckEffect
