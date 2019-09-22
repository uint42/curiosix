import EntityType from '../EntityType'
import Entity from '../Entity'
import { Mesh, MeshBasicMaterial, Font, TextBufferGeometry, Math as ThreeMath, MeshPhongMaterial } from 'three'
import curiosix from '../../main'

class EntityRover extends Entity {
  private static TEXT_PARAMETERS = {
    font: new Font(require('../../../assets/fonts/roboto_bold_typeface.json')),
    size: 0.15,
    height: 0.01,
    curveSegments: 12
  }

  type = EntityType.ROVER
  offset = 0.0
  boundingBox = 1
  height = 1

  _bricks: number = 0
  bricksMesh: Mesh

  public set bricks(v: number) {
    this.bricksMesh.geometry.dispose()
    this.bricksMesh.geometry = new TextBufferGeometry(v.toString(), EntityRover.TEXT_PARAMETERS)
    this._bricks = v
  }

  public get bricks(): number {
    return this._bricks
  }

  build() {
    this.object = curiosix.bootstrap.modelLoader.getModel('rover').clone()
    this.object.scale.setScalar(0.25)
    this.object.children.forEach((mesh: Mesh) => {
      mesh.translateX(1)
      mesh.translateY(0.25)
      mesh.translateZ(0.9)
    })
    this.createBricksMesh()
  }

  private createBricksMesh() {
    const material = new MeshPhongMaterial({
      color: 0x262d35,
      shininess: 20
    })
    const geometry = new TextBufferGeometry(this._bricks.toString(), EntityRover.TEXT_PARAMETERS)
    this.bricksMesh = new Mesh(geometry, material)
    this.bricksMesh.rotateX(ThreeMath.degToRad(90))
    this.bricksMesh.rotateY(ThreeMath.degToRad(180))
    this.bricksMesh.position.y = 1.12
    this.bricksMesh.position.x = -0.195
    this.object.add(this.bricksMesh)
  }

  reset() {
    super.reset()
    this.bricks = 0
  }
}

export default EntityRover
