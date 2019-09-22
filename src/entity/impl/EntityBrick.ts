import Entity from '../Entity'
import EntityType from '../EntityType'
import { MeshPhongMaterial, Mesh, DoubleSide, BoxBufferGeometry, Math as ThreeMath, BoxGeometry } from 'three'
import { EntityColor, getColorCode } from '../utils/EntityColor'
import { Vector3 } from '../../utils/Vector'

class EntityBrick extends Entity {
  type = EntityType.BRICK
  offset = 0.2
  boundingBox = 1
  height = 0.4
  randomRotation = ThreeMath.degToRad(Math.random() * 20 - 10)

  constructor(position: Vector3, rotation: number, id?: string, color: EntityColor = EntityColor.RED) {
    super(position, rotation, id, {
      color: color
    })
  }

  async build() {
    let brickGeometary = new BoxGeometry(0.9, 0.4, 0.9, 1, 1, 1)
    let brickMaterial = new MeshPhongMaterial({ color: getColorCode(this.additionalInformation.color), shininess: 100, side: DoubleSide })
    this.object = new Mesh(brickGeometary, brickMaterial)
  }

  updateCustoms() {
    this.object.rotateY(this.randomRotation)
  }
}

export default EntityBrick
