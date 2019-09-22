import Entity from '../Entity'
import { Object3D, Group, Mesh, Material } from 'three'
import curiosix from '../../main'

class SpawnAnimation {
  private static ANIMATION_TIME = 200

  private entity: Entity
  private meshes: Mesh[]
  private time: number = 0
  private remove: boolean

  constructor(entity: Entity, remove: boolean) {
    this.entity = entity
    this.remove = remove

    if (this.entity.object instanceof Group) {
      this.meshes = entity.object.children as Mesh[]
    } else {
      this.meshes = [this.entity.object as Mesh]
    }

    this.meshes.forEach(mesh => {
      if (mesh.material instanceof Material) {
        mesh.material.transparent = true
      }
    })
  }

  animate(estimatedTime: number): boolean {
    this.time += estimatedTime
    let progress = this.time / SpawnAnimation.ANIMATION_TIME
    if (progress >= 1) {
      progress = 1
      if (this.remove) {
        curiosix.world.group.remove(this.entity.object)
      }
    }
    this.meshes.forEach(mesh => {
      if (mesh.material instanceof Material) {
        mesh.material.opacity = this.remove ? 1 - progress : progress
      }
    })

    return progress === 1
  }
}

export default SpawnAnimation
