import World from '../World'
import { Object3D, Group, MeshBasicMaterial, PlaneGeometry, Mesh, DoubleSide, Math, Raycaster, Vector2, Material, PlaneBufferGeometry, DepthModes, NeverDepth } from 'three'
import curiosix from '../../main'
import * as VECTORS from '../../utils/Vector'
import { _Math } from 'three/src/math/Math'

class RaycastingGrid {
  sizeX: number
  sizeZ: number

  group: Object3D
  readonly planeVectorMap = new Map<string, VECTORS.Vector2>()
  currentPositionPlane: Mesh

  raycaster = new Raycaster()
  mouse = new Vector2()
  currentTarget: VECTORS.Vector2
  world: World

  constructor(world: World) {
    this.sizeX = world.size.x
    this.sizeZ = world.size.z

    this.group = new Group()
    this.world = world
  }

  setup() {
    this.createPlanes()
    this.addToScene()
    document.onmousemove = event => this.onMouseMove(event)
    this.currentPositionPlane = this.createCurrentPositionPlane()
  }

  createCurrentPositionPlane(): Mesh {
    const geometry = new PlaneBufferGeometry(1, 1, 1, 1)
    const material = new MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      depthFunc: NeverDepth,
      opacity: 0,
      side: DoubleSide
    })
    const mesh = new Mesh(geometry, material)
    mesh.rotateX(Math.degToRad(90))
    curiosix.scene.add(mesh)
    return mesh
  }

  private addToScene() {
    curiosix.scene.add(this.group)
  }

  disable() {
    ;(this.currentPositionPlane.material as Material).opacity = 0.0
  }

  update() {
    this.raycaster.setFromCamera(this.mouse, curiosix.rendererHelper.camera)
    const objects = this.raycaster.intersectObjects(this.group.children)
    if (objects.length >= 1) {
      const object = objects[0]
      this.currentTarget = this.planeVectorMap.get(object.object.uuid)
      this.currentPositionPlane.position.set(-this.currentTarget.x + 0.5, 0, -this.currentTarget.z + 0.5)
      ;(this.currentPositionPlane.material as Material).opacity = 0.3
    } else {
      this.currentTarget = undefined
      ;(this.currentPositionPlane.material as Material).opacity = 0.0
    }
  }

  private createPlanes() {
    const planeMaterial = new MeshBasicMaterial({
      color: 0xffffff,
      side: DoubleSide,
      transparent: true,
      opacity: 0
    })
    const planeGeometry = new PlaneBufferGeometry(1, 1, 1, 1)
    for (let x = 0; x < this.sizeX; x++) {
      for (let y = 0; y < this.sizeZ; y++) {
        const plane = new Mesh(planeGeometry, planeMaterial)
        plane.rotateX(Math.degToRad(90))
        plane.position.set(-x - 0.5, 0.001, -y - 0.5)
        this.group.add(plane)
        this.planeVectorMap.set(plane.uuid, new VECTORS.Vector2(x + 1, y + 1))
      }
    }
  }

  private onMouseMove(event: MouseEvent) {
    const boundingRect = curiosix.rendererHelper.renderer.domElement.getBoundingClientRect()
    this.mouse.x = ((event.clientX - boundingRect.left) / boundingRect.width) * 2 - 1
    this.mouse.y = -((event.clientY - boundingRect.top) / boundingRect.height) * 2 + 1
  }
}

export default RaycastingGrid
