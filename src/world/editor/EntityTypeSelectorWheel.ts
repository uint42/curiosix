import { Vector2 } from '../../utils/Vector'
import BuildEditor from './BuildEditor'
import { getColorCode, EntityColor } from '../../entity/utils/EntityColor'
import EntityType from '../../entity/EntityType'
import curiosix from '../../main'

class EntityTypeSelectorWheel {
  static MIN_OFFSET = 40
  static MAX_DISTANCE = 80
  static MAX_TIME = 400
  static STYLE_BORDER_COLOR_LABELS = ['borderTop', 'borderLeft', 'borderBottom', 'borderRight']

  private buildEditor: BuildEditor

  private entitySelector: HTMLDivElement
  private entitySelectorBoundingRect: DOMRect

  private entitySelectorWheel: HTMLDivElement
  private entitySelectorWheelRotation = 0

  private entityColorSelectorWheel: HTMLDivElement
  private entityColorSelectorWheelRotationMap: Map<EntityType, number> = new Map()

  private entitySelectorText: HTMLDivElement

  private lastSelectionChangeMousePosition: Vector2 = new Vector2()
  private lastSelectionChangeTime = 0

  private wheelEvent = event => {
    if (!this.buildEditor.enabled) return
    console.log(this.lastSelectionChangeMousePosition.distanceTo(new Vector2(event.x, event.y)))
    if (this.lastSelectionChangeMousePosition.distanceTo(new Vector2(event.x, event.y)) > EntityTypeSelectorWheel.MAX_DISTANCE && Date.now() - this.lastSelectionChangeTime > 400) {
      this.makeInvisible()
    }
  }

  constructor(buildEditor: BuildEditor) {
    this.buildEditor = buildEditor

    this.entitySelectorText = document.getElementById('entity_selector_text') as HTMLDivElement
    this.entitySelectorText.innerText = this.buildEditor.currentSelectedEntityType

    this.entitySelector = document.getElementById('entity_selector') as HTMLDivElement

    this.entitySelectorWheel = document.getElementById('entity_selector_wheel') as HTMLDivElement

    this.entityColorSelectorWheel = document.getElementById('entity_color_selector_wheel') as HTMLDivElement

    this.setBoundingRects()
    this.fillEntityColorRotationMap()
    this.setColors()
    this.addMouseMoveListener()
  }

  private setBoundingRects() {
    this.entitySelector.style.transition = null
    this.makeVisible()
    this.entitySelectorBoundingRect = this.entitySelector.getBoundingClientRect() as DOMRect

    this.makeInvisible()
    setTimeout(_ => (this.entitySelector.style.transition = 'opacity 200ms, transform 200ms'), 200)
  }

  private fillEntityColorRotationMap() {
    BuildEditor.ENTITY_TYPES_WITH_COLORS.forEach(entityType => {
      this.entityColorSelectorWheelRotationMap[entityType] = 0
    })
  }

  private addMouseMoveListener() {
    document.addEventListener('mousemove', this.wheelEvent)
  }

  private setColors() {
    this.entityColorSelectorWheel.style.borderTopColor = `#${getColorCode(EntityColor.RED).toString(16)}`
    this.entityColorSelectorWheel.style.borderLeftColor = `#${getColorCode(EntityColor.YELLOW).toString(16)}`
    this.entityColorSelectorWheel.style.borderBottomColor = `#${getColorCode(EntityColor.BLUE).toString(16)}`
    this.entityColorSelectorWheel.style.borderRightColor = `#${getColorCode(EntityColor.GREEN).toString(16)}`
  }

  leftEntityType() {
    this.entitySelectorWheelRotation--
  }

  rightEntityType() {
    this.entitySelectorWheelRotation++
  }

  leftEntityColor() {
    this.entityColorSelectorWheelRotationMap[this.buildEditor.currentSelectedEntityType] -= 1
  }

  rightEntityColor() {
    this.entityColorSelectorWheelRotationMap[this.buildEditor.currentSelectedEntityType] += 1
  }

  show(event: MouseEvent) {
    event.preventDefault()
    this.entitySelectorText.innerText = this.buildEditor.currentSelectedEntityType

    if (BuildEditor.ENTITY_TYPES_WITH_COLORS.indexOf(this.buildEditor.currentSelectedEntityType) > -1) {
      this.makeEntityColorSelectorVisible()
      this.entitySelectorWheel.style.borderTopColor = `#${getColorCode(BuildEditor.ENTITY_COLORS[this.buildEditor.entityTypeColors[this.buildEditor.currentSelectedEntityType]]).toString(16)}`
    } else {
      this.makeEntityColorSelectorInvisible()
      this.entitySelectorWheel.style.borderTopColor = null
    }

    this.entitySelectorWheel.style.transform = `rotate(${this.entitySelectorWheelRotation * 90}deg)`
    this.entityColorSelectorWheel.style.transform = `rotate(${(this.entityColorSelectorWheelRotationMap[this.buildEditor.currentSelectedEntityType] + this.buildEditor.currentSelectedEntityTypeIndex) *
      90}deg)`
    if (this.lastSelectionChangeMousePosition.distanceTo(new Vector2(event.x, event.y)) > EntityTypeSelectorWheel.MAX_DISTANCE && Date.now() - this.lastSelectionChangeTime > 400) {
      const position = this.calculatePosition(event)
      this.entitySelector.style.left = `${position.x}px`
      this.entitySelector.style.top = `${position.z}px`
    }

    this.makeVisible()

    this.lastSelectionChangeMousePosition.set(event.x, event.y)
    this.lastSelectionChangeTime = Date.now()
  }

  private calculatePosition(event: MouseEvent): Vector2 {
    const position = new Vector2(event.x - this.entitySelectorBoundingRect.width / 2, event.y - this.entitySelectorBoundingRect.width / 2)

    const renderCanvasBoundingRect = curiosix.rendererHelper.renderer.domElement.getBoundingClientRect()
    //TOP-LEFT min offset check
    if (position.x - renderCanvasBoundingRect.left < EntityTypeSelectorWheel.MIN_OFFSET) {
      position.x = renderCanvasBoundingRect.left + EntityTypeSelectorWheel.MIN_OFFSET
    }
    if (position.z - renderCanvasBoundingRect.top < EntityTypeSelectorWheel.MIN_OFFSET) {
      position.z = renderCanvasBoundingRect.top + EntityTypeSelectorWheel.MIN_OFFSET
    }

    //BOTTOM-RIGHT min offset check
    if (position.z > window.innerHeight - this.entitySelectorBoundingRect.height - EntityTypeSelectorWheel.MIN_OFFSET) {
      position.z = window.innerHeight - this.entitySelectorBoundingRect.height - EntityTypeSelectorWheel.MIN_OFFSET
    }
    if (position.x > window.innerWidth - this.entitySelectorBoundingRect.width - EntityTypeSelectorWheel.MIN_OFFSET) {
      position.x = window.innerWidth - this.entitySelectorBoundingRect.width - EntityTypeSelectorWheel.MIN_OFFSET
    }

    return position
  }

  hide() {
    this.makeInvisible()
  }

  delete() {
    document.removeEventListener('wheel', this.wheelEvent)
  }

  private makeVisible() {
    this.entitySelector.style.opacity = '1'
    this.entitySelector.style.transform = 'scale(1)'
  }

  private makeInvisible() {
    this.entitySelector.style.opacity = '0'
    this.entitySelector.style.transform = 'scale(0)'
  }

  private makeEntityColorSelectorVisible() {
    this.entityColorSelectorWheel.style.opacity = '1'
    this.entityColorSelectorWheel.style.transform = 'scale(1)'
  }

  private makeEntityColorSelectorInvisible() {
    this.entityColorSelectorWheel.style.opacity = '0'
    this.entityColorSelectorWheel.style.transform = 'scale(0.7)'
  }
}

export default EntityTypeSelectorWheel
