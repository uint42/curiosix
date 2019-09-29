import FileSelector from '../FileSelector'
import Swal from 'sweetalert2'
import curiosix from '../../../main'
import World from '../../../world/World'
import { Vector3 } from '../../Vector'
import { t } from '../../i18n'

class WorldFileSelector extends FileSelector {
  private noFileOpened: HTMLElement

  setup() {
    const element = this.create()
    element.style.gridColumn = '2/2'

    document.querySelector('main').appendChild(element)

    this.noFileOpened = document.querySelector('#renderer_container > .no-file-opened')
  }

  async newFileDialog() {
    const result = await Swal.fire({
      title: t('file_management.world.create_new.title'),
      html: `<input id="world-filename" class="swal2-input" placeholder="${t('file_management.filename')}">
      <input id="world-width" class="swal2-input" placeholder="${t('file_management.world.create_new.input.width')}" type="number" min="1" max="26" value="10" style="max-width: 100%;">
      <input id="world-length" class="swal2-input" placeholder="${t('file_management.world.create_new.input.length')}" type="number" min="1" max="26" value="10" style="max-width: 100%;">
      <input id="world-height" class="swal2-input" placeholder="${t('file_management.world.create_new.input.height')}"  type="number" min="1" max="26" value="6"  style="max-width: 100%;">`,
      inputPlaceholder: t('file_management.filename'),
      confirmButtonText: t('file_management.world.create_new.title'),
      onOpen: _ => {
        document.getElementById('world-filename').focus()
      },
      preConfirm: _ => {
        return new Promise((resolve, reject) => {
          resolve({
            fileName: (document.getElementById('world-filename') as HTMLInputElement).value,
            width: (document.getElementById('world-width') as HTMLInputElement).value,
            length: (document.getElementById('world-length') as HTMLInputElement).value,
            height: (document.getElementById('world-height') as HTMLInputElement).value
          })
        })
      }
    })
    if (result.dismiss) return
    const fileName: string = result.value.fileName.trim()
    if (fileName.length === 0) {
      Swal.fire({
        title: t('file_management.empty_name.title'),
        text: t('file_management.empty_name.text'),
        type: 'error'
      })
      return
    }
    if (await this.fileTypeManager.exists(fileName)) {
      Swal.fire({
        title: t('file_management.already_exists.title'),
        text: t('file_management.already_exists.text'),
        type: 'error'
      })
      return
    }
    const width = Math.floor(+result.value.width)
    const length = Math.floor(+result.value.length)
    const height = Math.floor(+result.value.height)
    if (width <= 0 || length <= 0 || height <= 0) {
      Swal.fire({
        title: t('file_management.world.invalid_input.title'),
        text: t('file_management.world.invalid_input.text'),
        type: 'error'
      })
      return
    }
    const world = new World(new Vector3(width, height, length), [])
    const worldFile = await this.fileTypeManager.new(fileName, world.toJSON())
    this.new(worldFile)
    this.open(worldFile.name)
  }

  set(data: any) {
    console.log('[File] Setting world...')
    if (curiosix.world) curiosix.world.delete()
    console.log('[File] Deleted current world')
    try {
      curiosix.world = World.fromJSON(data)
      console.log('[File] World loaded')
    } catch (e) {
      Swal.fire({
        title: t('file_management.world.loading_error.title'),
        text: t('file_management.world.loading_error.title'),
        type: 'error'
      })
      return
    }
    curiosix.world.init()
    console.log('[File] World initialized')
    this.noFileOpened.style.display = 'none'
  }

  empty() {
    this.noFileOpened.style.display = 'block'
    if (!curiosix.world) return
    curiosix.world.delete()
    delete curiosix.world
  }
}

export default WorldFileSelector
