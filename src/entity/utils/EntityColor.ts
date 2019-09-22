export enum EntityColor {
  RED = 'RED',
  YELLOW = 'YELLOW',
  BLUE = 'BLUE',
  GREEN = 'GREEN',
  BLACK = 'BLACK'
}

export function getNameOfColor(color: EntityColor): string {
  switch (color) {
    case EntityColor.RED:
      return 'Rot'
    case EntityColor.YELLOW:
      return 'Gelb'
    case EntityColor.BLUE:
      return 'Blau'
    case EntityColor.GREEN:
      return 'Grün'
    case EntityColor.BLACK:
      return 'Schwarz'
    default:
      throw new Error('Unknown color')
  }
}

export function getColorByName(colorName: string): EntityColor {
  switch (colorName) {
    case 'rot':
      return EntityColor.RED
    case 'gelb':
      return EntityColor.YELLOW
    case 'blau':
      return EntityColor.BLUE
    case 'grün':
      return EntityColor.GREEN
    case 'schwarz':
      return EntityColor.BLACK
    default:
      throw new Error('Unknown color')
  }
}

export function getColorCode(color: EntityColor): number {
  switch (color) {
    case EntityColor.RED:
      return 0xc0392b
    case EntityColor.YELLOW:
      return 0xf1c40f
    case EntityColor.BLUE:
      return 0x4b7bec
    case EntityColor.GREEN:
      return 0x2ecc71
    case EntityColor.BLACK:
      return 0x1e272e
    default:
      throw new Error('Unknown color')
  }
}
