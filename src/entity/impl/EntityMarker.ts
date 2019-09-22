import Entity from '../Entity'
import EntityType from '../EntityType'
import { DoubleSide, MeshPhongMaterial, BoxGeometry, Mesh, BoxBufferGeometry } from 'three'
import { EntityColor, getColorCode } from '../utils/EntityColor'
import { Vector2, Vector3 } from '../../utils/Vector'

class EntityMarker extends Entity {
  type = EntityType.MARKER
  offset = 0.015
  boundingBox = 0.2
  height = 0.03

  constructor(position: Vector3, rotation: number, id?: string, color: EntityColor = EntityColor.YELLOW) {
    super(position, rotation, id, {
      color: color
    })
  }

  async build() {
    let wallMaterial = new MeshPhongMaterial({ color: getColorCode(this.additionalInformation.color), shininess: 25, side: DoubleSide })
    let wallGeometary = new BoxBufferGeometry(1, 0.03, 1, 1, 1, 1)
    this.object = new Mesh(wallGeometary, wallMaterial)
  }
}

export default EntityMarker
