import FileTypeManager, { IFile } from './FileTypeManager'
import Swal from 'sweetalert2'

abstract class FileSelector {
  fileTypeManager: FileTypeManager
  wrapperElement: HTMLElement
  viewFilesElement: HTMLElement
  createNewFileElement: HTMLElement
  fileTabsElement: HTMLElement

  fileElements: FileElement[] = []
  currentFileName: string

  constructor(fileTypeManager: FileTypeManager) {
    this.fileTypeManager = fileTypeManager
  }

  protected create(fileViewerText: string): HTMLElement {
    this.wrapperElement = document.createElement('div')
    this.wrapperElement.classList.add('file-selector')

    const actionsDiv = document.createElement('div')
    actionsDiv.classList.add('file-selector-actions')
    this.wrapperElement.appendChild(actionsDiv)

    this.viewFilesElement = this.newIcon('format_list_bulleted')
    this.viewFilesElement.onclick = _ => this.openFileViewer(fileViewerText)
    actionsDiv.appendChild(this.viewFilesElement)

    this.createNewFileElement = this.newIcon('add_box')
    this.createNewFileElement.onclick = _ => this.newFileDialog()
    actionsDiv.appendChild(this.createNewFileElement)

    this.fileTabsElement = document.createElement('div')
    this.fileTabsElement.classList.add('file-selector-tabs')
    this.fileTabsElement.onwheel = event => {
      event.preventDefault()
      this.fileTabsElement.scrollBy({ left: event.deltaY, behavior: 'auto' })
    }
    this.wrapperElement.appendChild(this.fileTabsElement)

    const openedElements = localStorage.getItem(this.fileTypeManager.type.toUpperCase())
    if (openedElements) {
      const data = JSON.parse(atob(openedElements))
      data.forEach(async fileElement => {
        await this.new(await this.fileTypeManager.get(fileElement.name))
        if (fileElement.current) this.open(fileElement.name)
      })
    }

    return this.wrapperElement
  }

  abstract async setup()

  private newIcon(iconName: string, size: number = 48): HTMLElement {
    const element = document.createElement('i')
    element.classList.add('material-icons', `md-${size}`)
    element.innerText = iconName
    return element
  }

  protected abstract newFileDialog()

  protected async openFileViewer(title: string) {
    Swal.fire({
      title: title,
      html: (await this.fileTypeManager.all())
        .sort((a, b) => this.fileElements.filter(f => f.file.name === a.name).length - this.fileElements.filter(f => f.file.name === b.name).length)
        .map(
          file => `
          <div class="file-selector-list-filename ${this.fileElements.filter(f => f.file.name === file.name).length > 0 ? 'file-selector-list-filename-opened' : ''}">
            <span class="name">${file.name}</span>
            <span class="options">
              <i class="material-icons rename md-18">edit</i>
              <i class="material-icons delete">delete_forever</i>
            </span>
          </div>`
        )
        .join(''),
      showCloseButton: true,
      onBeforeOpen: modalElement => {
        document.querySelectorAll('.file-selector-list-filename').forEach((element: HTMLDivElement) => {
          const nameElement = element.querySelector('.name') as HTMLSpanElement
          const fileName = nameElement.innerText

          nameElement.onclick = async _ => {
            const files = this.fileElements.filter(f => f.file.name === fileName)
            if (files.length > 0) {
              this.open(fileName)
            } else {
              this.new(await this.fileTypeManager.get(fileName))
              this.open(fileName)
            }
            Swal.getCloseButton().click()
          }
          ;(element.querySelector('.rename') as HTMLElement).onclick = async _ => {
            Swal.getCloseButton().click()
            const result = await Swal.fire({
              title: 'Datei umbenennen',
              text: 'Wähle einen neuen Namen für die Datei',
              input: 'text',
              inputValue: fileName,
              type: 'question'
            })
            if (result.dismiss) return
            const newFileName: string = result.value.trim()
            if (await this.fileTypeManager.exists(newFileName)) {
              Swal.fire({
                title: 'Datei mit neuem Namen existiert bereits',
                text: 'Bitte wähle einen anderen neuen Dateinamen',
                type: 'error'
              })
              return
            }
            this.fileElements.filter(f => f.file.name === fileName).forEach(f => this.close(f))
            const file = await this.fileTypeManager.rename(fileName, newFileName)
            this.new(file)
            this.open(file.name)
          }
          ;(element.querySelector('.delete') as HTMLElement).onclick = async _ => {
            Swal.getCloseButton().click()
            const response = await Swal.fire({
              title: 'Bist du dir sicher?',
              text: `Bist du dir sicher, dass du die Datei ${fileName} unwiederruflich löschen willst?`,
              type: 'question',
              showCancelButton: true,
              showConfirmButton: true
            })
            if (response.value) {
              await this.fileTypeManager.delete(fileName)
              this.fileElements.filter(f => f.file.name === fileName).forEach(f => this.close(f))
              console.log('[File] Deleted file')
            }
          }
        })
      }
    })
  }

  protected async new(file: IFile) {
    const fileElement = new FileElement(file, this)
    fileElement.create()
    this.fileElements.push(fileElement)
    this.save()
  }

  async open(fileName: string) {
    const fileElemet = this.fileElements.filter(f => f.file.name === fileName)[0]!!
    fileElemet.wrapperElement.scrollIntoView({
      behavior: 'auto',
      inline: fileElemet.wrapperElement.getBoundingClientRect().left < 0 ? 'start' : 'end'
    })
    if (fileElemet.current) return
    this.fileElements.forEach(f => (f.current = false))
    fileElemet.current = true
    this.currentFileName = fileName
    this.set((await this.fileTypeManager.get(fileName)).data)
    this.save()
  }

  protected abstract set(data: any)
  protected abstract empty()

  async close(fileElement: FileElement) {
    const index = this.fileElements.indexOf(fileElement)
    if (index < 0) return
    this.fileTabsElement.removeChild(fileElement.wrapperElement)
    this.fileElements.splice(index, 1)
    if (fileElement._current) {
      if (this.fileElements[index - 1] !== undefined) {
        this.open(this.fileElements[index - 1].file.name)
      } else if (this.fileElements[index]) {
        this.open(this.fileElements[index].file.name)
      } else {
        this.empty()
        this.currentFileName = undefined
      }
    }
    this.save()
  }

  private save() {
    localStorage.setItem(this.fileTypeManager.type.toUpperCase(), btoa(JSON.stringify(this.fileElements.map(f => ({ name: f.file.name, current: f._current })))))
  }
}

class FileElement {
  file: IFile
  fileSelector: FileSelector

  wrapperElement: HTMLElement
  nameElement: HTMLElement
  closeElement: HTMLElement
  _current: boolean = false

  constructor(file: IFile, fileSelectorInstance: FileSelector) {
    this.file = file
    this.fileSelector = fileSelectorInstance
  }

  create() {
    this.wrapperElement = document.createElement('div')
    this.wrapperElement.classList.add('file-selector-tab')
    this.wrapperElement.onclick = event => {
      if (event.x >= this.closeElement.getBoundingClientRect().left) {
        this.fileSelector.close(this)
      } else {
        this.fileSelector.open(this.file.name)
      }
    }

    const iconElement = document.createElement('i')
    iconElement.innerText = this.fileSelector.fileTypeManager.type === 'script' ? 'code' : 'terrain'
    iconElement.classList.add('material-icons', 'md-18', 'file-selector-tab-icon')
    this.wrapperElement.appendChild(iconElement)

    this.nameElement = document.createElement('span')
    this.nameElement.innerText = this.file.name
    this.wrapperElement.appendChild(this.nameElement)

    this.closeElement = document.createElement('i')
    this.closeElement.innerText = 'close'
    this.closeElement.classList.add('material-icons', 'md-24', 'file-selector-tab-close')
    this.wrapperElement.appendChild(this.closeElement)

    this.fileSelector.fileTabsElement.appendChild(this.wrapperElement)
  }

  public set fileName(v: string) {
    this.nameElement!!.innerText = v
  }

  public set current(v: boolean) {
    this._current = v
    if (v) {
      this.wrapperElement.classList.add('file-selector-tab-current')
    } else {
      this.wrapperElement.classList.remove('file-selector-tab-current')
    }
  }
}

export default FileSelector
