import { Shape, Group, ExtrudeGeometry, Mesh, MeshStandardMaterial, Object3D, DoubleSide, Path, Vector2, TextGeometry, Font, Material, Math as ThreeMath } from 'three'

class Grid {
  segmentsX: number
  segmentsY: number
  object: Object3D
  lineWidth: number = 0.01
  lineHeight: number = 0.025

  constructor(segmentsX: number, segmentsY: number) {
    this.segmentsX = segmentsX
    this.segmentsY = segmentsY
    this.object = new Group()
    this.create()
  }

  private create() {
    const material = new MeshStandardMaterial({ color: 0x34495e, side: DoubleSide })

    this.addBasicGrid(material)

    this.addLetters(material)
  }

  private addBasicGrid(material: Material) {
    let shape = new Shape()

    /**
     * Create the basic shape of the grid
     */
    shape.lineTo(-this.lineWidth, -this.lineWidth)
    shape.lineTo(-this.lineWidth, this.segmentsY + this.lineWidth)
    shape.lineTo(this.segmentsX + this.lineWidth, this.segmentsY + this.lineWidth)
    shape.lineTo(this.segmentsX + this.lineWidth, -this.lineWidth)
    shape.lineTo(-this.lineWidth, -this.lineWidth)

    /**
     * Add holes to the grid
     */
    for (let x = 0; x < this.segmentsX; x++) {
      for (let y = 0; y < this.segmentsY; y++) {
        shape.holes.push(
          new Path([
            new Vector2(x + this.lineWidth, y + this.lineWidth),
            new Vector2(x + 1 - this.lineWidth, y + this.lineWidth),
            new Vector2(x + 1 - this.lineWidth, y + 1 - this.lineWidth),
            new Vector2(x + this.lineWidth, y + 1 - this.lineWidth)
          ])
        )
      }
    }

    /**
     * Add the grid to the group
     */
    const gridOutline = new Mesh(new ExtrudeGeometry(shape, { depth: this.lineHeight, bevelEnabled: false }), material)
    gridOutline.rotateX(ThreeMath.degToRad(90))
    gridOutline.position.set(-this.segmentsX, this.lineHeight, -this.segmentsY)
    this.object.add(gridOutline)
  }

  private addLetters(material: Material) {
    const font = new Font(require('../../assets/fonts/roboto_bold_typeface.json'))
    const textParameters = {
      font: font,
      size: 0.2,
      height: this.lineHeight,
      curveSegments: 12
    }

    const letters = new Group()

    for (let x = 0; x < this.segmentsX; x++) {
      const letterGeometry = new TextGeometry(String.fromCharCode(65 + x), textParameters)
      const letter = new Mesh(letterGeometry, material)
      letter.geometry.computeBoundingBox()
      letter.rotateX(ThreeMath.degToRad(90))
      letter.rotateY(ThreeMath.degToRad(180))
      letter.position.set(-x - 0.5 + letter.geometry.boundingBox.max.x / 2, 0, 0.1)
      letters.add(letter)
    }

    for (let y = 0; y < this.segmentsY; y++) {
      const letterGeometry = new TextGeometry((y + 1).toString(), textParameters)
      const letter = new Mesh(letterGeometry, material)
      letter.geometry.computeBoundingBox()
      letter.rotateX(ThreeMath.degToRad(90))
      letter.rotateY(ThreeMath.degToRad(180))
      letter.position.set(0.2 + letter.geometry.boundingBox.max.x, 0, -y - 0.5 - letter.geometry.boundingBox.max.y / 2)
      letters.add(letter)
    }

    this.object.add(letters)
  }
}

export default Grid
