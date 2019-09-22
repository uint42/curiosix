import { Object3D } from 'three'
import Bootstrap from './Bootstrap'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import Swal from 'sweetalert2'

class ModelLoader {
  private loadedModels: Map<string, Object3D> = new Map()
  private bootstrap: Bootstrap

  constructor(bootstrapInstance: Bootstrap) {
    this.bootstrap = bootstrapInstance
  }

  loadModels() {
    return new Promise<void>(async (resolve, reject) => {
      const loader = new GLTFLoader()
      try {
        await Promise.all(
          MODELS.map(model => {
            return new Promise<void>((resolve, reject) => {
              this.bootstrap.updateDescription(`Loading ${model.name} 3d model...`)
              loader.load(
                model.file,
                gltf => {
                  this.loadedModels[model.name.toUpperCase()] = gltf.scene.children[0]
                  resolve()
                },
                progressEvent => {
                  this.bootstrap.updateProgress(progressEvent.loaded / model.size)
                },
                event => {
                  Swal.fire(
                    'Fehler beim laden eines 3d Models',
                    'Es ist ein Fehler beim Laden eines 3d Models aufgetreten. Dies tut uns Leid. Versuche die Seite neu zu laden und den Cache zu leeren oder erstelle einen Issue auf GitHub',
                    'error'
                  )
                  console.error(model, event.error)
                  reject(event.error)
                }
              )
            })
          })
        )
      } catch (e) {
        reject(e)
      } finally {
        resolve()
      }
    })
  }

  getModel(name: string) {
    return this.loadedModels[name.toUpperCase()]
  }
}

export default ModelLoader

const MODELS = [
  {
    name: 'Rover',
    file: require('../../../assets/models/rover/Curiosity_static.glb'),
    size: 11_860_016 //bytes
  }
]
