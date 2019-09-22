import World from '../World'
import RaycastingGrid from './RaycastingGrid'
import curiosix from '../../main'
import EntityType from '../../entity/EntityType'
import { Vector3 } from '../../utils/Vector'
import EntityWall from '../../entity/impl/EntityWall'
import Entity from '../../entity/Entity'
import EntityMarker from '../../entity/impl/EntityMarker'
import EntityRover from '../../entity/impl/EntityRover'
import EntityBrick from '../../entity/impl/EntityBrick'
import { Math as ThreeMath } from 'three'
import EntityTypeSelectorWheel from './EntityTypeSelectorWheel'
import { EntityColor } from '../../entity/utils/EntityColor'

class BuildEditor {
  static ENTITY_TYPES = Object.keys(EntityType)
  static ENTITY_COLORS = [EntityColor.RED, EntityColor.YELLOW, EntityColor.BLUE, EntityColor.GREEN]
  static ENTITY_TYPES_WITH_COLORS = [EntityType.BRICK, EntityType.MARKER]

  private worldModeExecution: HTMLDivElement
  private worldModeBuild: HTMLDivElement

  private raycastingGrid: RaycastingGrid
  private world: World
  enabled: boolean = false

  currentSelectedEntityTypeIndex = 0
  currentSelectedEntityColorIndex = 0
  entityTypeColors: Map<EntityType, number> = new Map()

  currentSelectedEntityType: EntityType = EntityType.WALL

  entityTypeSelectorWheel: EntityTypeSelectorWheel

  private isShiftPressed: boolean = false

  constructor(world: World) {
    this.raycastingGrid = new RaycastingGrid(world)
    this.world = world
    this.entityTypeSelectorWheel = new EntityTypeSelectorWheel(this)

    this.worldModeExecution = document.getElementById('execution_mode') as HTMLDivElement
    this.worldModeBuild = document.getElementById('build_mode') as HTMLDivElement
  }

  setup() {
    document.body.focus({ preventScroll: true })
    this.raycastingGrid.setup()
    this.fillEntityColors()

    window.onkeydown = event => {
      if (event.code === 'Escape' && event.key === 'Escape') {
        event.preventDefault()
        this.toggle()
      }
      if (event.key === 'Shift') {
        this.isShiftPressed = true
      }
    }

    document.onkeyup = event => {
      if (event.key === 'Shift') {
        this.isShiftPressed = false
      }
    }
    ;(document.querySelector('.world-mode') as HTMLDivElement).onclick = event => {
      event.preventDefault()
      this.toggle()
    }

    const renderElement = curiosix.rendererHelper.renderer.domElement

    renderElement.onwheel = event => {
      if (!this.enabled) return
      const asd = curiosix.rendererHelper.renderer.domElement.getBoundingClientRect()
      const delta = event.deltaY
      const colorSupported = BuildEditor.ENTITY_TYPES_WITH_COLORS.indexOf(this.currentSelectedEntityType) > -1 && this.isShiftPressed
      if (delta < 0) {
        console.log('[World] Scrolled left')
        if (colorSupported) {
          this.entityTypeColors[this.currentSelectedEntityType] -= 1
          this.entityTypeSelectorWheel.leftEntityColor()
        } else {
          this.currentSelectedEntityTypeIndex--
          this.entityTypeSelectorWheel.leftEntityType()
        }
      } else if (delta > 0) {
        console.log('[World] Scrolled right')
        if (colorSupported) {
          this.entityTypeColors[this.currentSelectedEntityType] += 1
          this.entityTypeSelectorWheel.rightEntityColor()
        } else {
          this.currentSelectedEntityTypeIndex++
          this.entityTypeSelectorWheel.rightEntityType()
        }
      }

      if (colorSupported) {
        if (this.entityTypeColors[this.currentSelectedEntityType] < 0) {
          this.entityTypeColors[this.currentSelectedEntityType] = BuildEditor.ENTITY_COLORS.length - 1
        } else if (this.entityTypeColors[this.currentSelectedEntityType] >= BuildEditor.ENTITY_COLORS.length) {
          this.entityTypeColors[this.currentSelectedEntityType] = 0
        }
      } else {
        if (this.currentSelectedEntityTypeIndex < 0) {
          this.currentSelectedEntityTypeIndex = BuildEditor.ENTITY_TYPES.length - 1
        } else if (this.currentSelectedEntityTypeIndex >= BuildEditor.ENTITY_TYPES.length) {
          this.currentSelectedEntityTypeIndex = 0
        }
        this.currentSelectedEntityType = EntityType[BuildEditor.ENTITY_TYPES[this.currentSelectedEntityTypeIndex]]
      }

      this.entityTypeSelectorWheel.show(event)
    }

    renderElement.onclick = async event => {
      // Check if the code editor is highlighted
      if (curiosix.scriptingManager.codeEditor.codeMirror.hasFocus() || !this.enabled || event.which !== 1) return
      event.preventDefault()
      //Hide the entity type selector wheel
      this.entityTypeSelectorWheel.hide()
      //Check if the user has a current target
      if (!this.raycastingGrid.currentTarget) return
      let target = this.raycastingGrid.currentTarget
      let markers = 0
      //Remove enitities
      this.world.entities
        .filter(entity => {
          if (target.x !== entity.position.x || target.z !== entity.position.z) return false
          if (entity.type === EntityType.MARKER) markers++
          if (this.currentSelectedEntityType === EntityType.BRICK) return !(entity.type === EntityType.BRICK || entity.type === EntityType.MARKER || entity.type === EntityType.ROVER)
          if (this.currentSelectedEntityType === EntityType.MARKER) return !(entity.type === EntityType.BRICK || entity.type === EntityType.ROVER)
          if (this.currentSelectedEntityType === EntityType.ROVER) return !(entity.type === EntityType.BRICK || entity.type === EntityType.MARKER)
          return true
        })
        .forEach(entity => this.world.removeEntity(entity))
      //Create new entity and add it to the scene
      const newEntity = this.createNewEntity(target.toVector3(curiosix.world.getHeightOfPosition(target)), Math.round((ThreeMath.radToDeg(curiosix.rendererHelper.camera.rotation.z) + 180) / 90) * 90)
      await this.world.addEntity(newEntity)
      console.log('[World] Added entity')
    }

    renderElement.oncontextmenu = event => {
      if (curiosix.scriptingManager.codeEditor.codeMirror.hasFocus() || !this.enabled) return
      event.preventDefault()
      if (!this.raycastingGrid.currentTarget) return
      this.entityTypeSelectorWheel.hide()
      this.world.removeEntity(curiosix.world.getTopEntityOfPosition(this.raycastingGrid.currentTarget))
      console.log('[World] Removed entity')
    }
  }

  private fillEntityColors() {
    BuildEditor.ENTITY_TYPES_WITH_COLORS.forEach(entityType => {
      this.entityTypeColors[entityType] = 0
    })
  }

  private createNewEntity(position: Vector3, rotation: number): Entity {
    switch (this.currentSelectedEntityType) {
      case EntityType.WALL: {
        return new EntityWall(position, 0)
      }
      case EntityType.MARKER: {
        return new EntityMarker(position, 0, ThreeMath.generateUUID(), BuildEditor.ENTITY_COLORS[this.entityTypeColors[EntityType.MARKER]])
      }
      case EntityType.BRICK: {
        return new EntityBrick(position, 0, ThreeMath.generateUUID(), BuildEditor.ENTITY_COLORS[this.entityTypeColors[EntityType.BRICK]])
      }
      case EntityType.ROVER: {
        const rover = new EntityRover(position, 360 - rotation)
        if (this.world.rover) this.world.removeEntity(this.world.rover)
        this.world.rover = rover
        return rover
      }
    }
    return undefined as Entity
  }

  toggle() {
    this.enabled = !this.enabled
    if (this.enabled) {
      curiosix.rendererHelper.orbitControls.enabled = false
      if (curiosix.scriptingManager.interpreter) curiosix.scriptingManager.stop()
      curiosix.world.reset()
      this.worldModeExecution.classList.remove('current-world-mode')
      this.worldModeBuild.classList.add('current-world-mode')
      console.log('[World] Build mode activated')
    } else {
      curiosix.rendererHelper.orbitControls.enabled = true
      this.raycastingGrid.disable()
      this.entityTypeSelectorWheel.hide()
      this.worldModeExecution.classList.add('current-world-mode')
      this.worldModeBuild.classList.remove('current-world-mode')
      console.log('[World] Build mode deactivated')
    }
  }

  update() {
    if (!this.enabled) return
    this.raycastingGrid.update()
  }

  delete() {
    this.entityTypeSelectorWheel.delete()
  }
}

export default BuildEditor
