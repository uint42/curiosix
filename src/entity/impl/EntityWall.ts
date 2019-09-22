import Entity from '../Entity'
import { Mesh, MeshPhongMaterial, BoxBufferGeometry, FrontSide } from 'three'
import EntityType from '../EntityType'
import curiosix from '../../main'

class EntityWall extends Entity {
  type = EntityType.WALL
  offset = 0.4
  boundingBox = 1
  height = Infinity

  async build() {
    let wallGeometary = new BoxBufferGeometry(1, 0.8, 1, 1, 1, 1) //GREY: 0x1e272e | BLUE: 0x205b8e | ORANGE: 0xe15f41
    let wallMaterial = new MeshPhongMaterial({ color: 0xe15f41, shininess: 100, side: FrontSide })
    this.object = new Mesh(wallGeometary, wallMaterial)
  }

  onColision() {
    curiosix.scriptingManager.stop()
  }
}

export default EntityWall
