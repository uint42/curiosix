import FileSelector from '../FileSelector'
import Swal from 'sweetalert2'
import curiosix from '../../../main'

class ScriptFileSelector extends FileSelector {
  noFileOpened: HTMLElement

  setup() {
    const element = this.create('Skript - Explorer')
    element.style.gridColumn = '1/2'
    document.querySelector('main').appendChild(element)
    this.noFileOpened = document.querySelector('#code_mirror > .no-file-opened')
  }

  async newFileDialog() {
    const content = await Swal.fire({
      title: 'Erstelle ein neues Skript',
      input: 'text',
      inputPlaceholder: 'Dateiname',
      confirmButtonText: 'Erstelle eine neues Skript'
    })
    if (content.dismiss) return
    const fileName: string = content.value.trim()
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
    const file = await this.fileTypeManager.new(fileName, '')
    this.new(file)
    this.open(file.name)
  }

  protected set(data: string) {
    curiosix.scriptingManager.codeEditor.codeMirror.setValue(data)
    curiosix.scriptingManager.codeEditor.codeMirror.setOption('readOnly', false)
    curiosix.scriptingManager.codeEditor.codeMirror.focus()
    console.log('[File] Script loaded')
    this.noFileOpened.style.display = 'none'
  }

  empty() {
    curiosix.scriptingManager.codeEditor.codeMirror.setValue('')
    curiosix.scriptingManager.codeEditor.codeMirror.setOption('readOnly', true)
    this.noFileOpened.style.display = 'block'
  }
}

export default ScriptFileSelector
