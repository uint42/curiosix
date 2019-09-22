export class Vector2 {
  x: number
  z: number

  constructor(x: number = 0, z: number = 0) {
    this.x = x
    this.z = z
  }

  add(vector: Vector2) {
    this.x += vector.x
    this.z += vector.z
    return this
  }

  multiply(factor: number) {
    this.x *= factor
    this.z *= factor
    return this
  }

  distanceTo(vector: Vector2) {
    return Math.sqrt((vector.x - this.x) * (vector.x - this.x) + (vector.z - this.z) * (vector.z - this.z))
  }

  set(x: number, z: number) {
    this.x = x
    this.z = z
  }

  clone() {
    return new Vector2(this.x, this.z)
  }

  toVector3(y: number = 0) {
    return new Vector3(this.x, y, this.z)
  }
}

export class Vector3 {
  x: number
  y: number
  z: number

  constructor(x: number = 0, y: number = 0, z: number = 0) {
    this.x = x
    this.y = y
    this.z = z
  }

  add(vector: Vector3 | Vector2) {
    this.x += vector.x
    this.y += vector instanceof Vector3 ? vector.y : 0
    this.z += vector.z
    return this
  }

  multiply(factor: number) {
    this.x *= factor
    this.y *= factor
    this.z *= factor
    return this
  }

  distanceTo(vector: Vector3) {
    return Math.sqrt(Math.pow(vector.x - this.x, 2) + Math.pow(vector.y - this.y, 2) + Math.pow(vector.z - this.z, 2))
  }

  set(x: number, y: number, z: number) {
    this.x = x
    this.y = y
    this.z = z
  }

  clone() {
    return new Vector3(this.x, this.y, this.z)
  }

  toVector2() {
    return new Vector2(this.x, this.z)
  }
}
