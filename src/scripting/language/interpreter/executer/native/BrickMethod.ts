import { NativeMethod } from '../NativeMethod'
import { EntityColor } from '../../../../../entity/utils/EntityColor'
import curiosix from '../../../../../main'
import Entity from '../../../../../entity/Entity'
import EntityType from '../../../../../entity/EntityType'
import EntityMarker from '../../../../../entity/impl/EntityMarker'
import EntityBrick from '../../../../../entity/impl/EntityBrick'
import { Math as ThreeMath, DstAlphaFactor } from 'three'

class BrickMethod extends NativeMethod {
  action: BrickMethodAction
  amount: number
  color: EntityColor

  validateArguments(_arguments: any[]): string {
    if (_arguments.length !== 3) {
      return `Invalid amount of arguments (${_arguments.length} != 3)`
    }

    switch (_arguments[0]) {
      case 'place':
        this.action = BrickMethodAction.PLACE
        break
      case 'delete':
        this.action = BrickMethodAction.DELETE
        break
      default:
        return 'First argument "action" isn\'t a valid brick action'
    }

    if (typeof _arguments[1] !== 'number') {
      return 'Second argument "amount" isn\'t a number'
    }
    this.amount = +_arguments[1]

    if (this.action == BrickMethodAction.PLACE) {
      if (Object.values(EntityColor).includes(_arguments[2])) {
        this.color = _arguments[2]
      } else {
        return 'Third argument "color" isn\'t a entity color'
      }
    }

    const target = curiosix.world.rover.position.clone()
    target.add(curiosix.world.rover.getRotationAsVector())
    if (this.action === BrickMethodAction.DELETE) {
      curiosix.world.entities
        .filter(entity => entity.position.x === target.x && entity.position.z === target.z && entity.type === EntityType.BRICK)
        .sort((a, b) => b.position.y - a.position.y)
        .slice(0, this.amount)
        .forEach(entity => {
          curiosix.world.removeEntity(entity)
          curiosix.world.rover.bricks++
        })
    } else if (this.action === BrickMethodAction.PLACE) {
      for (let i = 0; i < this.amount; i++) {
        const entity = new EntityBrick(target.toVector2().toVector3(curiosix.world.getHeightOfPosition(target)), 0, ThreeMath.generateUUID(), this.color)
        curiosix.world.addEntity(entity)
        curiosix.world.rover.bricks--
        if (curiosix.world.rover.bricks < 0) {
          curiosix.world.rover.bricks = 0
        }
      }
    }
  }

  execute(progress: number, estiminatedProgress: number) {}

  finalise() {}
}

enum BrickMethodAction {
  PLACE,
  DELETE
}

export default BrickMethod
