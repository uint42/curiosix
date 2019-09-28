import { Object3D } from 'three'
import Bootstrap from './Bootstrap'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import Swal from 'sweetalert2'
import { t } from '../i18n'

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
              this.bootstrap.updateDescription(t('bootstrap.load_model.loading', { name: model.name }))
              loader.load(
                model.file,
                gltf => {
                  this.loadedModels[model.name.toUpperCase()] = gltf.scene.children[0]
                  resolve()
                },
                progressEvent => {
                  this.bootstrap.updateProgress(progressEvent.loaded / model.size)
                },
                async event => {
                  console.error(model, event.error)
                  await Swal.fire({
                    title: t('bootstrap.load_model.loading_error.title'),
                    text: t('bootstrap.load_model.loading_error.text'),
                    type: 'error',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    confirmButtonText: t('bootstrap.load_model.loading_error.reload_page')
                  })
                  location.reload(true)
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
