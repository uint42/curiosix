import { Vector3 } from '../utils/Vector'
import { Mesh, Math as ThreeMath, Object3D } from 'three'
import EntityType from './EntityType'
import curiosix from '../main'

abstract class Entity {
  id: string
  position: Vector3
  rotation: number

  defaultPosition: Vector3
  defaultRotation: number

  additionalInformation: any

  object: Object3D

  abstract boundingBox: number
  abstract type: EntityType
  abstract offset: number
  abstract height: number

  constructor(position: Vector3, rotation: number, id?: string, additionalInformation: any = {}) {
    this.position = position
    this.rotation = rotation

    this.defaultPosition = position
    this.defaultRotation = rotation
    this.additionalInformation = additionalInformation

    if (id) {
      this.id = id
    } else {
      this.id = ThreeMath.generateUUID()
    }
  }

  getRotationAsVector(rotation: number = this.rotation): Vector3 {
    let rotationAsRadians = ThreeMath.degToRad(rotation)
    return new Vector3(Math.round(Math.sin(rotationAsRadians) * 1_000) / 1_000, 0, Math.round(-Math.cos(rotationAsRadians) * 1_000) / 1_000)
  }

  reset() {
    this.position = this.defaultPosition.clone()
    this.rotation = this.defaultRotation
    this.update()
  }

  getPositionAsString(): string {
    return `(${String.fromCharCode(64 + this.position.x)}|${this.position.z})`
  }

  /**
   * Moved forward by the given distance/factor
   */
  move(distance: number, height: number) {
    let rotationVector = this.getRotationAsVector()
    rotationVector.multiply(distance)
    this.position.add(rotationVector)
    this.position.y += height
  }

  /**
   * Loads the model and updates its rotation an position
   * Get's called when the world is loading
   */
  async init() {
    await this.build()
    this.update()
  }

  /**
   * Creates/Loads the 3d model
   */
  abstract build()

  onColision() {}

  /**
   * Get's called every frame
   */
  update() {
    this.updateDefaults()
    this.updateCustoms()
  }

  /**
   * Updates the position and rotation
   */
  updateDefaults() {
    this.object.position.set(-this.position.x + 0.5, this.position.y + this.offset, -this.position.z + 0.5)
    this.object.rotation.y = -this.rotation * 0.017453293
  }

  /**
   * Allows an entity to have a special update method
   */
  updateCustoms() {}
}

export default Entity
