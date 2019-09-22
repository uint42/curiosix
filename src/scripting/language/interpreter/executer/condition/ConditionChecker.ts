import Condition from '../../../casl/utils/Condition'
import EntityType from '../../../../../entity/EntityType'
import curiosix from '../../../../../main'
import Entity from '../../../../../entity/Entity'
import BlockScanEffect from './effect/BlockScanEffect'
import CheckEffect from './CheckEffect'
import RotationEffect from './effect/RotationEffect'

class ConditionChecker {
  condition: Condition<any>
  fullfilled: boolean
  scanEffect: CheckEffect

  constructor(condition: Condition<any>) {
    this.condition = condition
  }

  parseCondition() {
    switch (this.condition.variable) {
      case 'facing_block': {
        this.parseBlock(this.condition, 'facing_block')
        break
      }
      case 'current_block': {
        this.parseBlock(this.condition, 'current_block')
        break
      }
      case 'rotation': {
        this.parseRotation(this.condition)
        break
      }
      case 'brick_amount': {
        this.parseBrickAmount(this.condition)
        break
      }
      default: {
        throw new Error('Unknown condition variable')
      }
    }
  }

  private parseBlock(condition: Condition<EntityType>, type: string) {
    const facingBlockPosition = curiosix.world.rover.position.clone()
    if (type === 'facing_block') facingBlockPosition.add(curiosix.world.rover.getRotationAsVector())
    const facingEntities = curiosix.world.entities.filter(entity => entity !== curiosix.world.rover && entity.position.x === facingBlockPosition.x && entity.position.z === facingBlockPosition.z)
    let facingEntityType: EntityType = undefined
    if (facingEntities.length >= 1) {
      facingEntityType = facingEntities[0].type
    }
    if (facingBlockPosition.x < 1 || facingBlockPosition.z < 1 || facingBlockPosition.x > curiosix.world.size.x || facingBlockPosition.z > curiosix.world.size.z) {
      facingEntityType = EntityType.WALL
    }
    this.fullfilled = condition.isFullfilled(facingEntityType)
    this.scanEffect = new BlockScanEffect(facingBlockPosition.toVector2())
  }

  private parseRotation(condition: Condition<number>) {
    this.scanEffect = new RotationEffect(condition.expectedValue)
    this.fullfilled = condition.isFullfilled(curiosix.world.rover.rotation % 360)
  }

  private parseBrickAmount(condition: Condition<number>) {
    console.log(curiosix.world.rover.bricks)
    this.scanEffect = new BlockScanEffect(curiosix.world.rover.position.toVector2())
    this.fullfilled = condition.isFullfilled(curiosix.world.rover.bricks)
  }
}

export default ConditionChecker
