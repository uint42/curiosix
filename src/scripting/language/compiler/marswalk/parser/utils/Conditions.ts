import Condition from '../../../../casl/utils/Condition'
import EntityType from '../../../../../../entity/EntityType'
import curiosix from '../../../../../../main'

export const CONDITIONS = new Map()

CONDITIONS.set('istwand', new Condition<EntityType>('facing_block', EntityType.WALL, false))
CONDITIONS.set('nichtistwand', new Condition<EntityType>('facing_block', EntityType.WALL, true))

CONDITIONS.set('istziegel', new Condition<EntityType>('facing_block', EntityType.BRICK, false))
CONDITIONS.set('nichtistziegel', new Condition<EntityType>('facing_block', EntityType.BRICK, true))

CONDITIONS.set('istmarke', new Condition<EntityType>('current_block', EntityType.MARKER, false))
CONDITIONS.set('nichtistmarke', new Condition<EntityType>('current_block', EntityType.MARKER, true))

CONDITIONS.set('istziegel', new Condition<EntityType>('facing_block', EntityType.BRICK, false))
CONDITIONS.set('nichtistziegel', new Condition<EntityType>('facing_block', EntityType.BRICK, true))

CONDITIONS.set('hatziegel', new Condition<number>('brick_amount', 0, true))

CONDITIONS.set('istnorden', new Condition<number>('rotation', 0, false))
CONDITIONS.set('istosten', new Condition<number>('rotation', 90, false))
CONDITIONS.set('istsüden', new Condition<number>('rotation', 180, false))
CONDITIONS.set('istwesten', new Condition<number>('rotation', 270, false))

export function parseCondition(conditionName: string): Condition<any> {
  if (!CONDITIONS.has(conditionName.toLowerCase())) {
    throw new Error('Unknown condition')
  } else {
    return CONDITIONS.get(conditionName)
  }
}
