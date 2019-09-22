import FileSelector from '../FileSelector'
import Swal from 'sweetalert2'
import curiosix from '../../../main'
import World from '../../../world/World'
import { Vector3 } from '../../Vector'

class WorldFileSelector extends FileSelector {
  private noFileOpened: HTMLElement

  setup() {
    const element = this.create('Welt - Explorer')
    element.style.gridColumn = '2/2'

    document.querySelector('main').appendChild(element)

    this.noFileOpened = document.querySelector('#renderer_container > .no-file-opened')
  }

  async newFileDialog() {
    const result = await Swal.fire({
      title: 'Erstelle eine neue Welt',
      html: `<input id="world-filename" class="swal2-input" placeholder="Dateiname">
      <input id="world-width" class="swal2-input" placeholder="Breite" type="number" min="1" max="26" value="10" style="max-width: 100%;">
      <input id="world-length" class="swal2-input" placeholder="Länge" type="number" min="1" max="26" value="10" style="max-width: 100%;">
      <input id="world-height" class="swal2-input" placeholder="Höhe"  type="number" min="1" max="26" value="6"  style="max-width: 100%;">`,
      inputPlaceholder: 'Dateiname',
      confirmButtonText: 'Erstelle eine neue Welt',
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
        title: 'Dateiname ist leer',
        text: 'Bitte wähle einen anderen Dateinamen',
        type: 'error'
      })
      return
    }
    if (await this.fileTypeManager.exists(fileName)) {
      Swal.fire({
        title: 'Datei existiert bereits',
        text: 'Bitte wähle einen anderen Dateinamen',
        type: 'error'
      })
      return
    }
    const width = +result.value.width
    const length = +result.value.length
    const height = +result.value.height
    if (width === 0 || length === 0 || height === 0) {
      Swal.fire({
        title: 'Ungültige Eingabe',
        text: 'Die Breite, Länge oder Höhe ist ungültig',
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
        title: 'Fehler beim Laden einer Welt',
        text: 'Beim Laden der Welt ist ein Fehler aufgetreten. Dies tut uns leid.',
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
