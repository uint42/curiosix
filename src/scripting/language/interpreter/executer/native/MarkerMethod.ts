import { NativeMethod } from '../NativeMethod'
import EntityMarker from '../../../../../entity/impl/EntityMarker'
import { EntityColor } from '../../../../../entity/utils/EntityColor'
import curiosix from '../../../../../main'
import EntityType from '../../../../../entity/EntityType'
import { Math as ThreeMath } from 'three'

class MarkerMethod extends NativeMethod {
  action: MarkerMethodAction
  targetEntity: EntityMarker
  color: EntityColor

  validateArguments(_arguments: any[]): string {
    if (_arguments.length !== 2) {
      return `Invalid amount of arguments (${_arguments.length} != 1)`
    }

    switch (_arguments[0]) {
      case 'place':
        this.action = MarkerMethodAction.PLACE
        break
      case 'delete':
        this.action = MarkerMethodAction.DELETE
        break
      default:
        return 'Unknown marker method action'
    }

    if (this.action == MarkerMethodAction.PLACE) {
      if (Object.values(EntityColor).includes(_arguments[1])) {
        this.color = _arguments[1]
      } else {
        return 'Second argument "color" isn\'t a entity color'
      }
    }

    curiosix.world.entities
      .filter(entity => entity.position.x === curiosix.world.rover.position.x && entity.position.z === curiosix.world.rover.position.z && entity.type === EntityType.MARKER)
      .forEach(entity => curiosix.world.removeEntity(entity))

    if (this.action === MarkerMethodAction.PLACE) {
      const entity = new EntityMarker(
        curiosix.world.rover.position.toVector2().toVector3(curiosix.world.getHeightForMarker(curiosix.world.rover.position.clone())),
        0,
        ThreeMath.generateUUID(),
        this.color
      )
      curiosix.world.addEntity(entity)
    }
    return undefined
  }

  execute(progress: number, estiminatedProgress: number) {}

  finalise() {}
}

enum MarkerMethodAction {
  PLACE,
  DELETE
}

export default MarkerMethod
