import Entity from '../entity/Entity'
import curiosix from '../main'
import Grid from './Grid'
import { Group, PointLight, Mesh, Vector3 as ThreeVector3 } from 'three'
import EntityRover from '../entity/impl/EntityRover'
import EntityType from '../entity/EntityType'
import EntityMarker from '../entity/impl/EntityMarker'
import EntityWall from '../entity/impl/EntityWall'
import { Vector3, Vector2 } from '../utils/Vector'
import BuildEditor from './editor/BuildEditor'
import EntityBrick from '../entity/impl/EntityBrick'
import SpawnAnimation from '../entity/utils/SpawnAnimation'
import Swal from 'sweetalert2'
import { t } from '../utils/i18n'

class World {
  size: Vector3

  rover: EntityRover
  entities: Entity[] = []
  temporaryObjets: Mesh[] = []

  private grid: Grid
  private light: PointLight
  private spawnAnimations: SpawnAnimation[] = []

  private changedPositions: Vector2[] = []

  group: Group
  loaded: boolean = false
  buildEditor: BuildEditor

  constructor(size: Vector3, entities: Entity[]) {
    this.size = size
    entities.forEach(entityObject => {
      let entity: Entity = fromObject(entityObject)
      if (entity === undefined) return //TODO: Add warning that the entity coudn't get parsed
      if (entity.type == EntityType.ROVER) {
        this.rover = entity as EntityRover
      }
      this.entities.push(entity)
    })
    this.buildEditor = new BuildEditor(this)
    //TODO: Add warning when the rover isn't set
  }

  async init() {
    console.log('[World] Initialize world...')
    this.group = new Group()
    this.setCameraTarget()
    this.addGrid()
    document.getElementById('renderer_container').classList.remove('world-not-set')
    await Promise.all(this.entities.map(entity => entity.init()))
    this.entities.forEach(entity => {
      this.group.add(entity.object)
    })
    curiosix.scene.add(this.group)
    this.buildEditor.setup()
    console.log('[World] Initialized')
    this.loaded = true
  }

  private setCameraTarget() {
    if (this.rover) curiosix.rendererHelper.orbitControls.target = new ThreeVector3(-this.rover.position.x + 0.5, 0, -this.rover.position.z + 0.5)
    this.light = new PointLight(0xffffff, 1)
    this.light.position.set(-this.size.x / 2, 3, -this.size.z / 2)
    this.group.add(this.light)
  }

  getHeightOfPosition(position: Vector2 | Vector3): number {
    if (position.x < 1 || position.z < 1 || position.x > this.size.x || position.z > this.size.z) {
      return Infinity
    }
    return this.entities
      .filter(entity => entity.position.x === position.x && entity.position.z === position.z)
      .map(entity => entity.height)
      .reduce((a, b) => a + b, 0)
  }

  getTopEntityOfPosition(position: Vector2 | Vector3): Entity {
    return this.entities
      .filter(entity => entity.position.x === position.x && entity.position.z === position.z)
      .sort((a, b) => a.position.y - b.position.y)
      .reverse()[0]
  }

  getHeightForMarker(position: Vector2 | Vector3): number {
    return this.entities
      .filter(entity => entity.position.x === position.x && entity.position.z === position.z && entity.type === EntityType.BRICK)
      .map(entity => entity.height)
      .reduce((a, b) => a + b, 0)
  }

  /**
   * Sorting macanism is now implemented in the addEntity/removeEntity function
   * @deprecated
   */
  sortBricksAndMarkersOLD(position: Vector2 | Vector3) {
    const marker = this.entities.filter(entity => entity.position.x == position.x && entity.position.z == position.z && entity.type === EntityType.MARKER)[0]
    if (!marker) {
      throw new Error("Can't find marker")
    }

    this.entities
      .filter(entity => entity.position.x == position.x && entity.position.z == position.z && entity.position.y > marker.position.y)
      .forEach(entity => {
        entity.position.y -= marker.height
        entity.defaultPosition = entity.position.clone()
      })
    marker.position.y = this.getHeightForMarker(position)
    marker.defaultPosition = marker.position.clone()
  }

  static fromJSON(data: any): World {
    let world = new World(data.size, data.entities)
    return world
  }

  delete() {
    this.buildEditor.delete()
    document.getElementById('renderer_container').classList.add('world-not-set')
    curiosix.scene.remove(this.group)
  }

  reset() {
    this.entities.forEach(entity => entity.reset())
    this.temporaryObjets.forEach(tempObject => this.group.remove(tempObject))
  }

  addTemporyObject(object: Mesh) {
    this.group.add(object)
    this.temporaryObjets.push(object)
  }

  removeTemporyObject(object: Mesh) {
    this.group.remove(object)
    this.temporaryObjets.splice(this.temporaryObjets.indexOf(object), 1)
  }

  toJSON() {
    return {
      size: this.size,
      entities: this.entities.map(entity => {
        return {
          type: entity.type,
          position: entity.position,
          rotation: entity.rotation,
          additionalInformation: entity.additionalInformation
        }
      })
    }
  }

  async addEntity(newEntity: Entity) {
    this.addChangedPosition(newEntity.position)

    if (
      newEntity.type === EntityType.BRICK &&
      this.entities.filter(entity => {
        return entity.position.x === newEntity.position.x && entity.position.z === newEntity.position.z && entity.type === EntityType.BRICK
      }).length >= curiosix.world.size.y
    ) {
      Swal.fire({
        position: 'bottom-right',
        backdrop: false,
        allowOutsideClick: false,
        text: t('world.maximal_build_height_reached'),
        showConfirmButton: false,
        width: 'max-content',
        timer: 2500
      })
      return
    }

    const posEntities = this.entities.filter(entity => {
      return entity.position.x === newEntity.position.x && entity.position.z === newEntity.position.z
    })
    if (newEntity.type === EntityType.BRICK || newEntity.type === EntityType.MARKER) {
      const heightForBrick = posEntities
        .filter(entity => entity.type === EntityType.BRICK)
        .map(entity => entity.height)
        .reduce((a, b) => a + b, 0)
      newEntity.position.y = heightForBrick

      posEntities
        .filter(entity => entity.position.y >= newEntity.position.y)
        .forEach(entity => {
          entity.position.y += newEntity.height
          entity.defaultPosition = entity.position.clone()
        })
    }
    await newEntity.init()
    newEntity.defaultPosition = newEntity.position.clone()
    this.group.add(newEntity.object)
    this.entities.push(newEntity)
    this.save()
    this.spawnAnimations.push(new SpawnAnimation(newEntity, false))
  }

  removeEntity(oldEntity: Entity) {
    if (!oldEntity) return
    this.addChangedPosition(oldEntity.position)
    const index = curiosix.world.entities.indexOf(oldEntity)
    if (index > -1) {
      curiosix.world.entities.splice(index, 1)
    }
    this.entities
      .filter(entity => entity.position.x === oldEntity.position.x && entity.position.z === oldEntity.position.z && entity.position.y > oldEntity.position.y)
      .forEach(entity => (entity.position.y -= oldEntity.height))
    this.spawnAnimations.push(new SpawnAnimation(oldEntity, true))
    if (curiosix.world.rover === oldEntity) {
      delete curiosix.world.rover
    }
    this.save()
  }

  save() {
    if (curiosix.fileManager) curiosix.fileManager.worldFileTypeManager.updateCurrent(this.toJSON())
  }

  private addChangedPosition(vector: Vector2 | Vector3) {
    let vector2 = vector instanceof Vector3 ? vector.toVector2() : vector

    if (this.changedPositions.filter(pos => pos.x === vector2.x && pos.z === vector2.z).length === 0) {
      this.changedPositions.push(vector2)
    }
  }

  addGrid() {
    this.grid = new Grid(this.size.x, this.size.z)
    this.group.add(this.grid.object)
  }

  animate(estimatedTime: number) {
    if (!this.loaded) return
    this.light.position.set(curiosix.rendererHelper.orbitControls.target.x, 3, curiosix.rendererHelper.orbitControls.target.z)

    this.buildEditor.update()

    this.entities.forEach(entity => {
      entity.update()
    })

    this.spawnAnimations.forEach(spawnAnimation => {
      if (spawnAnimation.animate(estimatedTime)) {
        const index = this.spawnAnimations.indexOf(spawnAnimation)
        if (index > -1) {
          this.spawnAnimations.splice(index, 1)
        }
      }
    })

    if (!this.rover) return
    this.entities
      .filter(entity => entity !== this.rover)
      .forEach(entity => {
        const topLeftBoundingPosition = entity.position.clone()
        topLeftBoundingPosition.add(new Vector2(entity.boundingBox / -2, entity.boundingBox / -2))
        const bottomRightBoundingPosition = entity.position.clone()
        bottomRightBoundingPosition.add(new Vector2(entity.boundingBox / 2, entity.boundingBox / 2))
        if (
          this.rover.position.x >= topLeftBoundingPosition.x &&
          this.rover.position.z >= topLeftBoundingPosition.z &&
          this.rover.position.x <= bottomRightBoundingPosition.x &&
          this.rover.position.z <= bottomRightBoundingPosition.z
        ) {
          entity.onColision()
        }
      })
  }
}

function fromObject(object: any) {
  switch (object.type) {
    case EntityType.ROVER:
      return new EntityRover(new Vector3(object.position.x, object.position.y, object.position.z), object.rotation, object.id)
    case EntityType.MARKER:
      return new EntityMarker(new Vector3(object.position.x, object.position.y, object.position.z), object.rotation, object.id, object.additionalInformation.color)
    case EntityType.WALL:
      return new EntityWall(new Vector3(object.position.x, object.position.y, object.position.z), object.rotation, object.id)
    case EntityType.BRICK:
      return new EntityBrick(new Vector3(object.position.x, object.position.y, object.position.z), object.rotation, object.id, object.additionalInformation.color)
    default:
      console.warn("Can't determ type of entity ", object)
      return undefined
  }
}

export default World
